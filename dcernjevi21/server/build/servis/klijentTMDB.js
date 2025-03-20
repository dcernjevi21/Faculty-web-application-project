export class TMDBklijent {
    bazicniURL = "https://api.themoviedb.org/3";
    apiKljuc;
    constructor(apiKljuc) {
        this.apiKljuc = apiKljuc;
    }
    //angular
    async dohvatiGalerijuSlikaPoId(id) {
        const resurs = `/person/${id}/images`;
        try {
            // Dohvaćanje odgovora
            const odgovor = await this.obaviZahtjev(resurs);
            // Provjeri sirovi odgovor
            if (!odgovor) {
                console.error("Prazan odgovor od API-ja");
                return [];
            }
            // Parsiranje odgovora
            const parsedResponse = JSON.parse(odgovor);
            // Provjeri postojanje 'cast'
            if (!parsedResponse.profiles || !Array.isArray(parsedResponse.profiles)) {
                console.error("Odgovor ne sadrži validno 'cast' polje:", parsedResponse);
                return [];
            }
            const slike = parsedResponse.profiles
                .slice(0, 10)
                .map((slika) => ({
                file_path: slika.file_path,
            }));
            console.log("prije returna", slike);
            return slike;
        }
        catch (error) {
            console.error("Greška pri dohvaćanju ili parsiranju podataka:", error);
            return [];
        }
    }
    async dohvatiFilmovePoId(id) {
        const resurs = `/person/${id}/movie_credits?language=en-US`;
        try {
            // Dohvaćanje odgovora
            const odgovor = await this.obaviZahtjev2(resurs);
            // Provjeri sirovi odgovor
            if (!odgovor) {
                console.error("Prazan odgovor od API-ja");
                return [];
            }
            // Parsiranje odgovora
            const parsedResponse = JSON.parse(odgovor);
            // Provjeri postojanje 'cast'
            if (!parsedResponse.cast || !Array.isArray(parsedResponse.cast)) {
                console.error("Odgovor ne sadrži validno 'cast' polje:", parsedResponse);
                return [];
            }
            // Mapiranje podataka u FilmTmdbI format
            const filmovi = parsedResponse.cast
                .slice(0, 5)
                .map((film) => ({
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
        }
        catch (error) {
            console.error("Greška pri dohvaćanju ili parsiranju podataka:", error);
            return [];
        }
    }
    async dohvatiOsobe(searchQuery, page) {
        if (!page) {
            page = 1;
        }
        let resurs = `/search/person?query=${searchQuery}&include_adult=false&language=en-US&page=${page}`; //query jer mora biti traženje imena po stringu
        let odgovor = await this.obaviZahtjev2(resurs);
        return JSON.parse(odgovor);
    }
    async dohvatiOsobu(name) {
        let resurs = "/search/person?query=" +
            name +
            "&include_adult=false&language=en-US&page=1";
        let odgovor = await this.obaviZahtjev2(resurs);
        let rezultati = JSON.parse(odgovor).results;
        return rezultati;
    }
    async pretraziFilmovePoNazivu(trazi, stranica) {
        let resurs = "/search/movie";
        let parametri = {
            sort_by: "popularity.desc",
            include_adult: false,
            page: stranica,
            query: trazi,
        };
        let odgovor = await this.obaviZahtjev(resurs, parametri);
        return JSON.parse(odgovor);
    }
    async pretraziOsobePoId(trazi) {
        const resurs = `/person/${trazi}`;
        let odgovor = await this.obaviZahtjev(resurs);
        return JSON.parse(odgovor);
    }
    async pretraziFilmovePoId(trazi) {
        const resurs = `/movie/${trazi}`;
        let odgovor = await this.obaviZahtjev(resurs);
        return JSON.parse(odgovor);
    }
    async obaviZahtjev(resurs, parametri = {}) {
        let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
        for (let p in parametri) {
            zahtjev += "&" + p + "=" + parametri[p];
        }
        console.log(zahtjev);
        let odgovor = await fetch(zahtjev);
        let rezultat = await odgovor.text();
        return rezultat;
    }
    async obaviZahtjev2(resurs, parametri = {}) {
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
