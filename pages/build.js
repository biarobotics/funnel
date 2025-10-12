export async function getServerSideProps() {
  return { redirect: { destination: '/build.html', permanent: false } };
}
export default function Page(){ return null; }
