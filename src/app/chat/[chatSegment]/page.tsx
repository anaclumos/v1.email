export default function ChatPage({
  params,
}: {
  params: { chatSegment: string };
}) {
  return <p>Chat: {params.chatSegment}</p>;
}
