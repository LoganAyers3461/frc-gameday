import { TBAClient } from "./tbaClient";

export const tba = new TBAClient(process.env.TBA_API_KEY!);