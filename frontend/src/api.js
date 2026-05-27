export async function uploadVideo(file, method = "classic") {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("method", method)  // Отправляем, но бэкенд всегда использует classic

  const response = await fetch("http://127.0.0.1:8000/analyze", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    console.error("HTTP Error:", response.status, errorText)
    throw new Error(`Ошибка сервера: ${response.status}`)
  }

  return await response.json()
}