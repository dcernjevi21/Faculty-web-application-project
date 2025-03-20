import { KorisnikI } from "../servisI/korisniciI.js";
import Baza from "../zajednicko/sqliteBaza.js";

export class KorisnikDAO {
  private baza: Baza;

  constructor() {
    this.baza = new Baza("podaci/RWA2024dcernjevi21_web.sqlite");
  }

  oznaciPristupRest(korime: string, vrijednost: number) {
    let sql = `UPDATE korisnik SET ima_pristup=? WHERE korime='${korime}'`;
    console.log(korime);
    let podaci = [vrijednost];
    this.baza.ubaciAzurirajPodatke(sql, podaci);
  }
  zatrazioPravo(korime: string) {
    let sql = `UPDATE korisnik SET zatrazio_pristup=1 WHERE korime='${korime}'`;
    console.log(korime);
    let podaci = [1];
    this.baza.ubaciAzurirajPodatke(sql, podaci);
  }

  azuriraj2fAutentifikaciju(
    korime: string,
    vrijednost: number,
    generirajTotp: number
  ) {
    let ubaci = false;
    if (vrijednost == 1) {
      ubaci = true;
    }
    let generiraniTotp = "";
    if (generirajTotp == 1) {
      generiraniTotp = this.generateRandomString(8);
      let sql = `UPDATE korisnik SET totp_tajniKljuc='${generiraniTotp}', two_factor = ${ubaci} WHERE korime='${korime}'`;
      this.baza.ubaciAzurirajPodatke(sql, []);
    } else {
      let sql = `UPDATE korisnik SET two_factor = ${ubaci} WHERE korime='${korime}'`;
      this.baza.ubaciAzurirajPodatke(sql, []);
    }
  }

  async dohvatiKorisnika(korime: string) {
    let sql = `SELECT * from korisnik where korime='${korime}'`;
    let [osoba] = (await this.baza.dajPodatkePromise(sql, [])) as unknown[];

    return osoba;
  }

  async dajSve(): Promise<Array<KorisnikI>> {
    let sql = "SELECT * FROM korisnik;";
    var podaci = (await this.baza.dajPodatkePromise(
      sql,
      []
    )) as Array<KorisnikI>;
    let rezultat = new Array<KorisnikI>();
    for (let p of podaci) {
      let k: KorisnikI = {
        ime: p["ime"],
        prezime: p["prezime"],
        korime: p["korime"],
        lozinka: p["lozinka"],
        email: p["email"],
        adresa: p["adresa"],
        telefon: p["telefon"],
        datum_rodenja: p["datum_rodenja"],
        tip_korisnika_id: p["tip_korisnika_id"],
        ima_pristup: p["ima_pristup"],
        zatrazio_pristup: p["zatrazio_pristup"],
        totp_tajniKljuc: p["totp_tajniKljuc"],
        two_factor: p["two_factor"],
      };
      rezultat.push(k);
    }
    return rezultat;
  }

  async daj(korime: string): Promise<KorisnikI | null> {
    let sql = "SELECT * FROM korisnik WHERE korime=?;";
    var podaci = (await this.baza.dajPodatkePromise(sql, [
      korime,
    ])) as Array<KorisnikI>;

    if (podaci.length == 1 && podaci[0] != undefined) {
      let p = podaci[0];
      let k: KorisnikI = {
        korime: p["korime"],
        email: p["email"],
        lozinka: p["lozinka"],
        ime: p["ime"],
        prezime: p["prezime"],
        adresa: p["adresa"],
        telefon: p["telefon"],
        datum_rodenja: p["datum_rodenja"],
        tip_korisnika_id: p["tip_korisnika_id"],
        ima_pristup: p["ima_pristup"],
        zatrazio_pristup: p["zatrazio_pristup"],
        totp_tajniKljuc: p["totp_tajniKljuc"],
        two_factor: p["two_factor"],
      };
      console.log(k);
      return k;
    }

    return null;
  }

  dodaj(korisnik: any) {
    console.log(korisnik);

    const mappedKorisnik = {
      korime: korisnik.data.username,
      email: korisnik.data.email,
      lozinka: korisnik.data.password,
      ime: korisnik.data.firstName || null,
      prezime: korisnik.data.lastName || null,
      adresa: korisnik.data.address || null,
      telefon: korisnik.data.telephone || null,
      datum_rodenja: korisnik.data.birthDate || null,
    };

    let sql = `INSERT INTO korisnik (email, korime, lozinka, ime, prezime, adresa, telefon, datum_rodenja, tip_korisnika_id, ima_pristup,totp_tajniKljuc,two_factor) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

    let podaci = [
      mappedKorisnik.email,
      mappedKorisnik.korime,
      mappedKorisnik.lozinka,
      mappedKorisnik.ime,
      mappedKorisnik.prezime,
      mappedKorisnik.adresa,
      mappedKorisnik.telefon,
      mappedKorisnik.datum_rodenja,
      2,
      0,
      "",
      0,
    ];

    try {
      this.baza.ubaciAzurirajPodatke(sql, podaci);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  obrisi(korime: string) {
    let sql = "DELETE FROM korisnik WHERE korime=?";
    this.baza.ubaciAzurirajPodatke(sql, [korime]);
    return true;
  }

  azurirajZatrazioPravoPristupa(korime: string, pristup: number) {
    let sql = `UPDATE korisnik SET zatrazio_pristup=? WHERE korime=?`;
    let podaci = [pristup, korime];
    this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
  }

  azurirajPravoPristupa(korime: string, pristup: number) {
    let sql = `UPDATE korisnik SET ima_pristup=? WHERE korime=?`;
    let podaci = [pristup, korime];
    this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
  }

  azuriraj(korime: string, korisnik: KorisnikI) {
    let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, email=?, adresa=?, telefon=?, datum_rodenja=? WHERE korime=?`;
    let podaci = [
      korisnik.ime,
      korisnik.prezime,
      korisnik.lozinka,
      korisnik.email,
      korisnik.adresa,
      korisnik.telefon,
      korisnik.datum_rodenja,
      korime,
    ];
    this.baza.ubaciAzurirajPodatke(sql, podaci);
    return true;
  }

  generateRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}
