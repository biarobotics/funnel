// pages/index.js
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/index.html',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
