import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const { url } = req.body
            const response = await axios.post(`${process.env.BACKEND_URL}/api/infer-menu`, { url }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout: 30000, // 30 seconds timeout
            })
            res.status(200).json(response.data)
        } catch (error) {
            console.error('Error inferring menu:', error)
            if (axios.isAxiosError(error) && error.response) {
                res.status(error.response.status).json({ error: error.response.data.detail || error.response.data.error || 'Failed to infer menu' })
            } else {
                res.status(500).json({ error: 'An unexpected error occurred' })
            }
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}