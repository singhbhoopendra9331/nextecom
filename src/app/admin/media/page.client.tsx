"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { axios } from "@/lib/axios";

export default function MediaPageClient({ initialData }: any) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  console.log("MediaPageClient data", data);
  const fetchMedia = (page: number, searchTerm: string) => {
    startTransition(async () => {
      const res = await axios.get(
        `/api/media?page=${page}&limit=20&search=${searchTerm}`
      );

      console.log("fetchMedia res", res);

      const json = await res.data;
      setData(json);
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchMedia(1, value);
  };

  const changePage = (page: number) => {
    fetchMedia(page, search);
  };

  return (
    <div className="space-y-6">
      <input
        placeholder="Search media..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="border rounded px-3 py-2 w-full max-w-sm"
      />

      {isPending && <p>Loading...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.docs.map((item: any) => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden bg-white"
          >
            <Image
              src={item.url}
              alt={item.originalName}
              width={300}
              height={200}
              className="w-full h-32 object-cover"
            />

            <div className="p-2 text-xs truncate">
              {item.originalName}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <button
          disabled={data.pagination.page === 1}
          onClick={() => changePage(data.pagination.page - 1)}
        >
          Prev
        </button>

        <span>
          {data.pagination.page} / {data.pagination.pages}
        </span>

        <button
          disabled={
            data.pagination.page === data.pagination.pages
          }
          onClick={() => changePage(data.pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}