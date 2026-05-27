import cv2
import numpy as np
import os

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)
eye_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml'
)


def preprocess_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray_enhanced = clahe.apply(gray)
    gray_blur = cv2.GaussianBlur(gray_enhanced, (5, 5), 0)
    return gray, gray_blur


def detect_face_reliable(gray):
    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5,
        minSize=(100, 100), flags=cv2.CASCADE_SCALE_IMAGE
    )
    if len(faces) == 0:
        return None
    return max(faces, key=lambda f: f[2] * f[3])


def detect_eyes_reliable(face_roi, face_w):
    h, w = face_roi.shape[:2]
    eye_region = face_roi[0:int(h * 0.5), :]

    eyes = eye_cascade.detectMultiScale(
        eye_region, scaleFactor=1.1, minNeighbors=8,
        minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE
    )

    if len(eyes) == 0:
        return []

    valid_eyes = []
    for (ex, ey, ew, eh) in eyes:
        center_x = ex + ew // 2
        if face_w * 0.15 < center_x < face_w * 0.85:
            if 20 < eh < h * 0.6:
                valid_eyes.append((ex, ey, ew, eh))

    valid_eyes.sort(key=lambda e: e[0])
    if len(valid_eyes) > 2:
        valid_eyes = sorted(valid_eyes, key=lambda e: e[2] * e[3], reverse=True)[:2]
        valid_eyes.sort(key=lambda e: e[0])

    return valid_eyes


def detect_pupil_reliable(eye_roi, prev_pupil=None):
    if eye_roi.size == 0:
        return None

    h, w = eye_roi.shape[:2]
    gray = cv2.cvtColor(eye_roi, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    blurred = cv2.GaussianBlur(enhanced, (7, 7), 2)

    _, _, minLoc, _ = cv2.minMaxLoc(blurred)
    cx, cy = minLoc

    roi_size = int(min(h, w) * 0.4)
    x1 = max(cx - roi_size, 0)
    y1 = max(cy - roi_size, 0)
    x2 = min(cx + roi_size, w)
    y2 = min(cy + roi_size, h)

    pupil_roi = blurred[y1:y2, x1:x2]

    _, _, minLoc2, _ = cv2.minMaxLoc(pupil_roi)
    min_val = pupil_roi[minLoc2[1], minLoc2[0]]
    threshold = min(255, min_val * 1.8)

    _, binary = cv2.threshold(pupil_roi, threshold, 255, cv2.THRESH_BINARY_INV)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=2)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=1)

    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    best_contour = None
    best_score = 0

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 50 or area > (w * h * 0.6):
            continue
        perimeter = cv2.arcLength(cnt, True)
        if perimeter == 0:
            continue
        circularity = 4 * np.pi * area / (perimeter ** 2)
        if circularity < 0.6:
            continue

        score = area * circularity
        if prev_pupil is not None:
            px, py, pr = prev_pupil
            dist = ((cx + x1 - px) ** 2 + (cy + y1 - py) ** 2) ** 0.5
            if dist < 30:
                score *= 1.5

        if score > best_score:
            best_score = score
            best_contour = cnt

    if best_contour is None:
        return None

    (x, y), radius = cv2.minEnclosingCircle(best_contour)
    final_x = int(x + x1)
    final_y = int(y + y1)
    final_radius = int(radius)

    if not (0 < final_x < w and 0 < final_y < h):
        return None
    if final_radius < 5 or final_radius > min(h, w) * 0.4:
        return None

    return final_x, final_y, final_radius


def detect_blink(eye_roi, prev_aspect=None):
    if eye_roi.size == 0:
        return True
    h, w = eye_roi.shape[:2]
    aspect = h / w if w > 0 else 0
    if prev_aspect and aspect < prev_aspect * 0.5:
        return True
    return aspect < 0.2


def analyze_pupil_response(pupil_sizes, fps=25, flash_frame=50):
    if not pupil_sizes or len(pupil_sizes) < 10:
        return None

    cleaned = []
    last_valid = None
    for p in pupil_sizes:
        if p > 0:
            last_valid = p
            cleaned.append(p)
        elif last_valid is not None:
            cleaned.append(last_valid)
        else:
            cleaned.append(0)

    baseline_start = max(0, flash_frame - 25)
    baseline_frames = cleaned[baseline_start:flash_frame]
    baseline = np.mean(baseline_frames) if len(baseline_frames) >= 5 else np.mean([p for p in cleaned if p > 0] or [10])

    constriction_start = flash_frame + int(0.3 * fps)
    constriction_end = flash_frame + int(1.5 * fps)
    constriction_window = cleaned[constriction_start:min(constriction_end, len(cleaned))]
    min_diameter = min(constriction_window) if constriction_window else baseline
    constriction_amplitude = max(0, baseline - min_diameter)

    latency_frames = 0
    for i in range(flash_frame, min(flash_frame + 40, len(cleaned))):
        if cleaned[i] < baseline * 0.97:
            latency_frames = i - flash_frame
            break

    recovery_threshold = baseline * 0.9
    recovery_frames = 0
    post = cleaned[constriction_end:min(constriction_end + 100, len(cleaned))]
    for i, val in enumerate(post):
        if val >= recovery_threshold:
            recovery_frames = i + (constriction_end - flash_frame)
            break

    recovery_velocity = (recovery_threshold - min_diameter) / (
                recovery_frames / fps) if recovery_frames > 0 and post else 0
    valid = [p for p in cleaned if p > 0]

    return {
        "baseline_diameter": float(baseline),
        "min_diameter": float(min_diameter),
        "constriction_amplitude": float(constriction_amplitude),
        "constriction_latency_ms": float(latency_frames * 1000 / fps),
        "recovery_time_ms": float(recovery_frames * 1000 / fps) if recovery_frames > 0 else None,
        "recovery_velocity": float(recovery_velocity),
        "variability": float(np.std(valid)) if len(valid) > 5 else 0,
        "mean_pupil": float(np.mean(valid)) if valid else 0
    }


def process_video(input_path, upload_folder, method="classic", flash_frame=50):
    debug_log = []
    cap = cv2.VideoCapture(input_path)

    if not cap.isOpened():
        return {"error": "Не удалось открыть видео", "debug": ["video_open_failed"]}

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    debug_log.append(f"video_info:{width}x{height}@{fps}fps,{total_frames}frames")
    debug_log.append(f"method:{method}")
    debug_log.append(f"flash_frame:{flash_frame}({flash_frame / fps:.2f}s)")

    if width == 0 or height == 0:
        return {"error": "Неверные параметры", "debug": ["invalid_dimensions"]}

    base_name = os.path.basename(input_path)
    name_no_ext = os.path.splitext(base_name)[0]
    output_path = os.path.join(upload_folder, f"{name_no_ext}_processed.mp4")

    debug_log.append(f"output_path:{output_path}")

    # 🔥 ИЗМЕНЕНИЕ: Один надежный кодек вместо перебора
    # 'avc1' = H.264 — работает во всех браузерах
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    if not out.isOpened():
        return {"error": "Не удалось создать видео", "debug": debug_log + ["write_failed"]}

    debug_log.append(f"codec:H.264(avc1)")

    # Сбор данных
    pupil_sizes = []
    blink_count = 0
    frame_count = 0
    written_frames = 0
    prev_pupil = None
    prev_aspect = None
    faces_detected = 0
    eyes_detected = 0
    pupils_detected = 0

    baseline_pupils = []
    post_flash_pupils = []
    flash_detected = False

    debug_log.append("processing_start")

    while True:
        ret, frame = cap.read()
        if not ret:
            debug_log.append(f"end_of_video:frames={frame_count},written={written_frames}")
            break

        frame_count += 1
        is_flash_frame = abs(frame_count - flash_frame) <= 2

        if is_flash_frame and not flash_detected:
            flash_detected = True
            debug_log.append(f"FLASH_DETECTED:frame_{frame_count}")
            baseline_pupils = [p for p in pupil_sizes if p > 0]

        try:
            display_frame = frame.copy()
            gray, gray_blur = preprocess_frame(frame)

            pupil_found = False
            pupil_radius = 0

            face = detect_face_reliable(gray_blur)

            if face is not None:
                faces_detected += 1
                x, y, w, h = face
                face_roi = frame[y:y + h, x:x + w]

                eyes = detect_eyes_reliable(face_roi, w)

                if len(eyes) > 0:
                    eyes_detected += 1

                    if prev_pupil is not None:
                        best_eye = min(eyes, key=lambda e:
                        abs((e[0] + e[2] // 2) - prev_pupil[0]) +
                        abs((e[1] + e[3] // 2) - prev_pupil[1]))
                    else:
                        best_eye = eyes[0]

                    ex, ey, ew, eh = best_eye
                    eye_roi = face_roi[ey:ey + eh, ex:ex + ew]
                    aspect = eh / ew if ew > 0 else 0

                    if prev_aspect and aspect < prev_aspect * 0.5:
                        blink_count += 1
                        pupil_sizes.append(0)
                    else:
                        pupil = detect_pupil_reliable(eye_roi, prev_pupil)

                        if pupil:
                            px, py, radius = pupil
                            abs_x = x + ex + px
                            abs_y = y + ey + py

                            cv2.circle(display_frame, (abs_x, abs_y), radius, (0, 255, 255), 2)
                            cv2.circle(display_frame, (abs_x, abs_y), 3, (0, 0, 255), -1)
                            cv2.rectangle(display_frame, (x + ex, y + ey), (x + ex + ew, y + ey + eh), (0, 255, 0), 2)

                            pupil_found = True
                            pupil_radius = radius
                            pupils_detected += 1
                            prev_pupil = (abs_x, abs_y, radius)
                        else:
                            pupil_sizes.append(0)

                    cv2.rectangle(display_frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
                    prev_aspect = aspect
                else:
                    prev_aspect = None
            else:
                prev_aspect = None

            if pupil_found:
                pupil_sizes.append(pupil_radius)
                if flash_detected and frame_count > flash_frame + int(0.3 * fps):
                    post_flash_pupils.append(pupil_radius)

            if is_flash_frame:
                cv2.putText(display_frame, "FLASH!", (20, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                cv2.rectangle(display_frame, (0, 0), (width, height), (255, 0, 0), 5)
            else:
                cv2.putText(display_frame, f"Frame: {frame_count}", (20, height - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            out.write(display_frame)
            written_frames += 1

        except Exception as e:
            debug_log.append(f"error:frame_{frame_count}:{str(e)[:50]}")
            continue

    # 🔥 ОБЯЗАТЕЛЬНОЕ ОСВОБОЖДЕНИЕ
    cap.release()
    out.release()

    # 🔥 ПРОВЕРКА РЕЗУЛЬТАТА
    if os.path.exists(output_path):
        file_size = os.path.getsize(output_path)
        debug_log.append(f"output_file_size:{file_size}bytes")

        if file_size < 1000:
            debug_log.append("ERROR:file_too_small_codec_issue")
        else:
            debug_log.append(f"SUCCESS:written={written_frames},size={file_size}")
    else:
        debug_log.append("ERROR:output_file_not_created")

    debug_log.append(
        f"complete:faces={faces_detected},eyes={eyes_detected},pupils={pupils_detected},written={written_frames}")
    debug_log.append(f"baseline_samples:{len(baseline_pupils)},post_flash_samples:{len(post_flash_pupils)}")

    valid_pupils = [p for p in pupil_sizes if p > 0]

    if len(valid_pupils) < 10:
        return {
            "error": "Недостаточно данных",
            "debug": debug_log,
            "stats": {"valid_pupils": len(valid_pupils), "written_frames": written_frames}
        }

    metrics = analyze_pupil_response(pupil_sizes, fps, flash_frame)
    if not metrics:
        return {"error": "Ошибка анализа", "debug": debug_log}

    latency = metrics["constriction_latency_ms"]
    recovery = metrics["recovery_time_ms"]
    amplitude = metrics["constriction_amplitude"]

    if latency > 450 or (recovery and recovery > 2500) or amplitude < 0.3:
        state = "Высокая когнитивная нагрузка"
    elif latency > 300 or (recovery and recovery > 1500) or amplitude < 0.8:
        state = "Умеренная когнитивная нагрузка"
    else:
        state = "Состояние близко к норме"

    duration_sec = frame_count / fps
    blink_rate = (blink_count / duration_sec) * 60 if duration_sec > 0 else 0

    return {
        "mean_pupil": metrics["mean_pupil"],
        "baseline_diameter": metrics["baseline_diameter"],
        "constriction_amplitude": metrics["constriction_amplitude"],
        "constriction_latency_ms": metrics["constriction_latency_ms"],
        "recovery_time_ms": metrics["recovery_time_ms"],
        "recovery_velocity": metrics["recovery_velocity"],
        "variability": metrics["variability"],
        "blink_rate": blink_rate,
        "state": state,
        "method": method,
        "video_path": output_path,
        "pupil_sizes": pupil_sizes,
        "frame_count": frame_count,
        "fps": fps,
        "flash_frame": flash_frame,
        "debug": debug_log,
        "stats": {
            "total_frames": frame_count,
            "written_frames": written_frames,
            "faces_detected": faces_detected,
            "eyes_detected": eyes_detected,
            "pupils_detected": pupils_detected,
            "blinks": blink_count,
            "valid_pupil_frames": len(valid_pupils),
            "baseline_samples": len(baseline_pupils),
            "post_flash_samples": len(post_flash_pupils)
        }
    }