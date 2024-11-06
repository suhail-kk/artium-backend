import Pusher from 'pusher'


const options: any = {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY_ID,
    secret: process.env.PUSHER_SECRET_ID,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  };
  
  const pusherServer = new Pusher(options);
  
  export default pusherServer;
  