import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'node:formidable'
import fs from 'node:fs/promises'
import path from 'node:path'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    try {
        const { fields, files } = await parseForm(req)
        let payload: any
        let headers: Record<string, string> = {
            'Accept': 'application/json',
        }

        if (files.image) {
            // Image upload mode
            const file = Array.isArray(files.image) ? files.image[0] : files.image
            const formData = new FormData()
            const fileContent = await fs.readFile(file.filepath)
            formData.append('image', new Blob([fileContent]), file.originalFilename || 'image')
            payload = formData
            headers['Content-Type'] = 'multipart/form-data'
        } else if (fields.manual_items) {
            // Manual entry mode
            const manualItems = Array.isArray(fields.manual_items) ? fields.manual_items[0] : fields.manual_items
            payload = JSON.stringify({ manual_items: JSON.parse(manualItems) })
            headers['Content-Type'] = 'application/json'
        } else {
            return res.status(400).json({ error: 'Either image or manual items must be provided' })
        }

        const response = await fetch(`${process.env.BACKEND_URL}/api/infer-menu`, {
            method: 'POST',
            headers,
            body: payload,
        })

        if (!response.ok) {
            const errorData = await response.json()
            return res.status(response.status).json({ error: errorData.detail || errorData.error || 'Failed to infer menu' })
        }

        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        console.error('Error inferring menu:', error)
        res.status(500).json({ error: 'An unexpected error occurred' })
    }
}

function parseForm(req: NextApiRequest): Promise<{ fields: any, files: any }> {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm()
        form.parse(req, (err, fields, files) => {
            if (err) reject(err)
            else resolve({ fields, files })
        })
    })
}