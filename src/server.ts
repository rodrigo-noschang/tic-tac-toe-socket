import { httpServer } from "./httpServer";
import './websocket';
const runningPORT = process.env.PORT || 3001;

httpServer.listen(runningPORT, () => {
    console.log(`App running on PORT ${runningPORT}`)
});