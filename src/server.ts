import { httpServer } from "./httpServer";
import './websocket';
const PORT = 3001;

httpServer.listen(PORT, () => console.log(`App running on PORT ${PORT}`));