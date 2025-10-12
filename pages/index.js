// pages/index.js
export default function Home() {
  // This component never renders because we redirect on the server.
  return null;
}

export async function getServerSideProps() {
  // Redirect the root (/) to your static landing page
  return {
    redirect: {
      destination: '/index.html',
      permanent: false,
    },
  };
}
