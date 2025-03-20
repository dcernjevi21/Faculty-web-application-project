import { FilmTmdbI } from "../servisI/tmdbI.js";
import Baza from "../zajednicko/sqliteBaza.js";

export class FilmDAO {
  private baza: Baza;

  constructor() {
    this.baza = new Baza("podaci/RWA2024dcernjevi21_servis.sqlite");
  }

  /*async dajSveFilmove(): Promise<Array<FilmTmdbI>> {
		let sql = "SELECT * FROM film;";
		var podaci = (await this.baza.dajPodatkePromise(
			sql,
			[]
		)) as Array<FilmTmdbI>;
		let rezultat = new Array<FilmTmdbI>();
		for (let p of podaci) {
			let k: FilmTmdbI = {
				original_language: p["original_language"],
				original_title: p["original_title"],
				overview: p["overview"],
				popularity: p["popularity"],
				poster_path: p["poster_path"],
				release_date: p["release_date"],
				title: p["title"],
			};
			rezultat.push(k);
		}
		return rezultat;
	}

	async dajFilm(id: number): Promise<FilmTmdbI | null> {
		let sql = "SELECT * FROM film WHERE film_id=?;";
		var podaci = (await this.baza.dajPodatkePromise(sql, [
			id,
		])) as Array<FilmTmdbI>;

		if (podaci.length == 1 && podaci[0] != undefined) {
			let p = podaci[0];
			let k: FilmTmdbI = {
				original_language: p["original_language"],
				original_title: p["original_title"],
				overview: p["overview"],
				popularity: p["popularity"],
				poster_path: p["poster_path"],
				release_date: p["release_date"],
				title: p["title"],
			};
			return k;
		}
		return null;
	}*/

  dodajFilmove(filmovi: FilmTmdbI[]) {
    if (filmovi.length === 0) {
      console.log("Nema filmova za dodati.");
      return false;
    }

    const sql = `
			INSERT OR IGNORE INTO film 
			(film_id, originalni_naslov, naslov, datum_izdavanja, jezik, opis, slika_postera, popularnost, unix_timestamp_datum) 
			VALUES ${filmovi.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")}
		`;

    const podaci: any[] = [];
    filmovi.forEach((film) => {
      const unixTimestamp = Math.floor(new Date(film.release_date).getTime());

      podaci.push(
        film.id,
        film.original_language,
        film.original_title,
        film.release_date,
        film.original_language,
        film.overview,
        film.poster_path || "Nepoznato",
        film.popularity,
        unixTimestamp
      );
    });

    try {
      this.baza.ubaciAzurirajPodatke(sql, podaci);
      console.log(`${filmovi.length} filmova uspješno dodano u bazu.`);
      return true;
    } catch (error) {
      console.error("Greška pri dodavanju filmova u bazu:", error);
      return false;
    }
  }

  poveziOsobeIFilmove(filmovi: FilmTmdbI[], idOsobePoFilmu: number) {
    if (filmovi.length === 0) {
      console.log("Nema filmova za dodati.");
      return false;
    }

    const sql2 = `
        INSERT INTO osobaFilm (osoba_id, film_id, lik) 
        VALUES ${filmovi.map(() => "(?, ?, ?)").join(", ")}`;

    const podaci2: any[] = [];
    filmovi.forEach((film) => {
      podaci2.push(idOsobePoFilmu, film.id, "Zasad nije implementirano");
    });

    try {
      this.baza.ubaciAzurirajPodatke(sql2, podaci2);
      console.log(`osoba uspjesno povezana s filmovima.`);
      return true;
    } catch (error) {
      console.error("Greška pri povezivanju osoba i filmova u bazu:", error);
      return false;
    }
  }

  obrisiFilm(id: number) {
    let sql =
      "SELECT COUNT(*) as broj FROM film WHERE film_id = ? AND NOT EXISTS (SELECT 1 FROM osobaFilm WHERE osobaFilm.film_id = film.film_id);";

    let sql2 =
      "DELETE FROM film WHERE film_id = ? AND NOT EXISTS (SELECT 1 FROM osobaFilm WHERE osobaFilm.film_id = film.film_id)";

    try {
      const rezultat: any[] = this.baza.dajPodatke(sql, [id]);
      const br = rezultat[0]?.broj || 0;
      console.log(`Broj: ${br}`);
      if (br != 0) {
        this.baza.ubaciAzurirajPodatke(sql2, [id]);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Greška pri brisanju filma:", error);
      return false;
    }
  }

  obrisiFilmBezVeza() {
    const sql =
      "DELETE FROM film WHERE film_id NOT IN (SELECT DISTINCT film_id FROM osobaFilm)";

    try {
      this.baza.ubaciAzurirajPodatke(sql, []);
      console.log(`filmovi bez veza su uspješno obrisani.`);
      return true;
    } catch (error) {
      console.error("Greška pri povezivanju osoba i filmova u bazu:", error);
      return false;
    }
  }

  obrisiFilmPovezanOsobom(id: number) {
    const sql = "DELETE FROM osobaFilm WHERE osoba_id = ?";

    try {
      this.baza.ubaciAzurirajPodatke(sql, [id]);
      console.log(`uspjesno obrisani povezani filmovi.`);

      return true;
    } catch (error) {
      console.error("Greška pri povezivanju osoba i filmova u bazu:", error);
      return false;
    }
  }

  async dajfilmoveVezaneUzOsobuPoStranicama(
    id: number,
    stranica: number
  ): Promise<Array<FilmTmdbI>> {
    const sql =
      "SELECT f.film_id AS id, f.originalni_naslov AS original_title, f.naslov AS title, f.datum_izdavanja AS release_date, f.jezik AS original_language, f.opis AS overview, f.slika_postera AS poster_path, f.popularnost AS popularity FROM film f JOIN osobaFilm of ON f.film_id = of.film_id WHERE of.osoba_id = ? LIMIT 20 OFFSET ?";

    let offset: number;
    let rezultat = new Array<FilmTmdbI>();

    if (stranica == 0) {
      offset = 0;
    } else {
      offset = stranica * 20 - 20;
    }

    const spojeno: number[] = [id, offset];

    var podaci = (await this.baza.dajPodatkePromise(
      sql,
      spojeno
    )) as Array<FilmTmdbI>;

    for (let p of podaci) {
      let k: FilmTmdbI = {
        id: p["id"],
        original_language: p["original_language"],
        original_title: p["original_title"],
        overview: p["overview"],
        popularity: p["popularity"],
        poster_path: p["poster_path"],
        release_date: p["release_date"],
        title: p["title"],
      };
      rezultat.push(k);
    }

    return rezultat;
  }

  async dajFilmovePoStranicama(
    stranica: number,
    datumOd?: number,
    datumDo?: number
  ): Promise<Array<FilmTmdbI>> {
    let offset: number;
    let rezultat = new Array<FilmTmdbI>();

    if (stranica == 0) {
      offset = 0;
    } else {
      offset = stranica * 20 - 20;
    }

    let sql =
      "SELECT film_id AS id, originalni_naslov AS original_title, naslov AS title, datum_izdavanja AS release_date, jezik AS original_language, opis AS overview, slika_postera AS poster_path, popularnost AS popularity FROM film";

    if (!datumOd || !datumDo) {
      sql += ` LIMIT 20 OFFSET ${offset}`;
      podaci = (await this.baza.dajPodatkePromise(sql, [])) as Array<FilmTmdbI>;
    } else if (datumOd && datumDo) {
      sql += ` WHERE unix_timestamp_datum BETWEEN ? AND ? LIMIT 20 OFFSET ${offset}`;

      const spojeno: number[] = [datumOd, datumDo, offset];
      var podaci = (await this.baza.dajPodatkePromise(
        sql,
        spojeno
      )) as Array<FilmTmdbI>;
    } else if (datumOd) {
      sql += ` WHERE unix_timestamp_datum > ? LIMIT 20 OFFSET ${offset}`;
      const spojeno: number[] = [datumOd, offset];
      var podaci = (await this.baza.dajPodatkePromise(
        sql,
        spojeno
      )) as Array<FilmTmdbI>;
    } else {
      sql += ` WHERE unix_timestamp_datum < ? LIMIT 20 OFFSET ${offset}`;
      const spojeno: number[] = [datumDo, offset];
      var podaci = (await this.baza.dajPodatkePromise(
        sql,
        spojeno
      )) as Array<FilmTmdbI>;
    }

    for (let p of podaci) {
      let k: FilmTmdbI = {
        id: p["id"],
        original_language: p["original_language"],
        original_title: p["original_title"],
        overview: p["overview"],
        popularity: p["popularity"],
        poster_path: p["poster_path"],
        release_date: p["release_date"],
        title: p["title"],
      };
      rezultat.push(k);
    }
    console.log(sql);
    return rezultat;
  }
}
