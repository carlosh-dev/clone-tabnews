import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DataBaseInfos />
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pr-BR");
  }
  return <div>Última atualização: {updatedAtText}</div>;
}

function DataBaseInfos() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) return <></>;

  const { open_connections, max_connections, version } =
    data.dependecies.database;

  return (
    <div>
      <span>Conexões abertas: {open_connections}</span>
      <br />
      <span>Máximo de conexões: {max_connections}</span>
      <br />
      <spaan>Versão banco: {version}</spaan>
    </div>
  );
}
