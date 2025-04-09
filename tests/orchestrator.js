import retry from "async-retry";

async function waitForAllServices() {
  return waitForWebServices();

  async function waitForWebServices() {
    return retry(fetchStatusPage,{
      retries: 100,
    })

    async function fetchStatusPage(){
      const response = await fetch("http://localhost:3000/api/v1/status")
      const responseJSON = await response.json; 
    }
  }
}

export default {
  waitForAllServices
}