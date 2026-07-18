export async function fetchApod(apiKey) {
  const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`)
  if (!res.ok) throw new Error(`apod ${res.status}`)
  const d = await res.json()
  const isVideo = d.media_type === 'video'
  return { title: d.title, imageUrl: isVideo ? (d.thumbnail_url ?? null) : d.url, isVideo }
}
