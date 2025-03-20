import Baza from "../zajednicko/sqliteBaza.js";

export class ServisDAO {
	private baza_servis: Baza;

	constructor() {
		this.baza_servis = new Baza("podaci/RWA2024dcernjevi21_servis.sqlite");
	}
	dajPrava(korime: string) {
		let sql = `INSERT INTO korisnik_s_dozvolom (korisnicko_ime) VALUES (?)`;
		console.log(korime);
		let podaci = [korime];
		this.baza_servis.ubaciAzurirajPodatke(sql, podaci);
	}

	makniPrava(korime: string) {
		let sql = "DELETE FROM korisnik_s_dozvolom WHERE korisnicko_ime=?";
		this.baza_servis.ubaciAzurirajPodatke(sql, [korime]);
	}
}
