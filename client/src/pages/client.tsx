import { useRoute } from "wouter";
import ClientPortal from "@/components/ClientPortal";

export default function Client() {
  const [, params] = useRoute("/client/:username");
  return <ClientPortal username={params?.username || ''} />;
}
