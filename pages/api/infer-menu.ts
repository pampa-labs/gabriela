import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const { url } = req.body
            const response = await axios.post('http://your-backend-url/api/infer-menu', { url })
            res.status(200).json(response.data)
        } catch (error) {
            res.status(500).json({ error: 'Failed to infer menu' })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}