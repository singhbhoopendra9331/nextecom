"use client";

import PageForm from "@/components/admin/page-form";

export default function CreatePagePage({ params }: { params: { id: string } }) {
  return <PageForm mode="create" pageId={params.id} />;
}
