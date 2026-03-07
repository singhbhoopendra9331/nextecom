import { axios } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"

interface Params {
    page: number
    search: string
}

export function useMedia({ page, search }: Params) {
    return useQuery({
        queryKey: ["media", page, search],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: "20",
                search,
            })

            const res = await axios.get(`/api/admin/media?${params}`)
            if (!res.data) throw new Error("Failed to fetch media")

            return res.data
        },
    })
}