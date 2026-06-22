export default function RichTextRender({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};
