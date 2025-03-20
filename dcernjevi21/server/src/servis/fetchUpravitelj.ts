import * as jwt from "../zajednicko/jwt.js";
import { Request, Response } from "express";
import { RWASession } from "./htmlUpravitelj.js";

export class FetchUpravitelj {
	private tajniKljucJWT: string;

	constructor(tajniKljucJWT: string) {
		this.tajniKljucJWT = tajniKljucJWT;
	}

	async getJWT(zahtjev: Request, odgovor: Response) {
		odgovor.type("json");
		let sesija = zahtjev.session as RWASession;
		if (sesija["korime"] != null) {
			let k = { korime: sesija.korime, tip_korisnika: sesija.tip_korisnika_id };
			let noviToken = jwt.kreirajToken(k, this.tajniKljucJWT);
			odgovor.send({ ok: noviToken });
			return;
		}
		odgovor.status(401);
		odgovor.send({ greska: "nemam token!" });
	}
}
