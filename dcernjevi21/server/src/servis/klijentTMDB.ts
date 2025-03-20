import {
  FilmoviTmdbI,
  OsobaTmdbI,
  OsobeTmdbI,
  FilmTmdbI,
  ImageDataI,
} from "../servisI/tmdbI.js";

export class TMDBklijent {
  private bazicniURL = "https://api.themoviedb.org/3";
  private apiKljuc: string;
  constructor(apiKljuc: string) {
    this.apiKljuc = apiKljuc;
  }

  public async dohvatiGalerijuSlikaPoId(id: number): Promise<ImageDataI[]> {
    const resurs = `/person/${id}/images`;

    try {
      const odgovor = await this.obaviZahtjev(resurs);

      if (!odgovor) {
        console.error("Prazan odgovor od API-ja");
        return [];
      }

      const parsedResponse = JSON.parse(odgovor);

      if (!parsedResponse.profiles || !Array.isArray(parsedResponse.profiles)) {
        console.error(
          "Odgovor ne sadrži validno 'cast' polje:",
          parsedResponse
        );
        return [];
      }

      const slike: ImageDataI[] = parsedResponse.profiles
        .slice(0, 10)
        .map((slika: ImageDataI) => ({
          file_path: slika.file_path,
        }));
      console.log("prije returna", slike);
      return slike;
    } catch (error) {
      console.error("Greška pri dohvaćanju ili parsiranju podataka:", error);
      return [];
    }
  }

  public async dohvatiFilmovePoId(id: number): Promise<FilmTmdbI[]> {
    const resurs = `/person/${id}/movie_credits?language=en-US`;

    try {
      const odgovor = await this.obaviZahtjev2(resurs);

      if (!odgovor) {
        console.error("Prazan odgovor od API-ja");
        return [];
      }

      const parsedResponse = JSON.parse(odgovor);
      if (!parsedResponse.cast || !Array.isArray(parsedResponse.cast)) {
        console.error(
          "Odgovor ne sadrži validno 'cast' polje:",
          parsedResponse
        );
        return [];
      }

      const filmovi: FilmTmdbI[] = parsedResponse.cast
        .slice(0, 5)
        .map((film: any) => ({
          id: film.id,
          original_language: film.original_language,
          original_title: film.original_title,
          overview: film.overview,
          popularity: film.popularity,
          poster_path: film.poster_path,
          release_date: film.release_date,
          title: film.title,
        }));
      console.log(filmovi);
      return filmovi;
    } catch (error) {
      console.error("Greška pri dohvaćanju ili parsiranju podataka:", error);
      return [];
    }
  }

  public async dohvatiOsobe(searchQuery: string, page?: number) {
    if (!page) {
      page = 1;
    }
    let resurs = `/search/person?query=${searchQuery}&include_adult=false&language=en-US&page=${page}`;
    let odgovor = await this.obaviZahtjev2(resurs);

    return JSON.parse(odgovor) as OsobeTmdbI;
  }

  public async dohvatiOsobu(name: string) {
    let resurs =
      "/search/person?query=" +
      name +
      "&include_adult=false&language=en-US&page=1";
    let odgovor = await this.obaviZahtjev2(resurs);
    let rezultati = JSON.parse(odgovor).results as OsobaTmdbI[];
    return rezultati;
  }

  public async pretraziFilmovePoNazivu(trazi: string, stranica: number) {
    let resurs = "/search/movie";
    let parametri = {
      sort_by: "popularity.desc",
      include_adult: false,
      page: stranica,
      query: trazi,
    };

    let odgovor = await this.obaviZahtjev(resurs, parametri);
    return JSON.parse(odgovor) as FilmoviTmdbI;
  }

  public async pretraziOsobePoId(trazi: number) {
    const resurs = `/person/${trazi}`;

    let odgovor = await this.obaviZahtjev(resurs);
    return JSON.parse(odgovor) as OsobaTmdbI;
  }

  public async pretraziFilmovePoId(trazi: number) {
    const resurs = `/movie/${trazi}`;

    let odgovor = await this.obaviZahtjev(resurs);
    return JSON.parse(odgovor) as FilmoviTmdbI;
  }

  private async obaviZahtjev(
    resurs: string,
    parametri: { [kljuc: string]: string | number | boolean } = {}
  ) {
    let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
    for (let p in parametri) {
      zahtjev += "&" + p + "=" + parametri[p];
    }
    console.log(zahtjev);
    let odgovor = await fetch(zahtjev);
    let rezultat = await odgovor.text();
    return rezultat;
  }

  private async obaviZahtjev2(
    resurs: string,
    parametri: { [kljuc: string]: string | number | boolean } = {}
  ) {
    let zahtjev = this.bazicniURL + resurs + "&api_key=" + this.apiKljuc;
    for (let p in parametri) {
      zahtjev += "&" + p + "=" + parametri[p];
    }
    console.log(zahtjev);
    let odgovor = await fetch(zahtjev);
    let rezultat = await odgovor.text();
    return rezultat;
  }
}
