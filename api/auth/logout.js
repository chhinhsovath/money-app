export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  res.setHeader(
    'Set-Cookie',
    'token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/'
  )

  res.json({ message: 'Logged out successfully' })
}