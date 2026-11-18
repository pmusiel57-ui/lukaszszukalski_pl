# lukaszszukalski.pl

Kod stron dla domeny **lukaszszukalski.pl**, przygotowany dla repozytorium `pmusiel57-ui/lukaszszukalski_pl`. Każda podstrona ma osobny folder i własny plik `index.html`. Pliki przeznaczone do wyświetlania na stronie znajdują się w katalogu [public](public).

## Gdzie edytować strony

| Adres | Plik w repozytorium | Obecny stan |
| --- | --- | --- |
| `lukaszszukalski.pl/` | [public/index.html](public/index.html) | Strona główna na Cloudflare |
| `lukaszszukalski.pl/obszary/` | [public/obszary/index.html](public/obszary/index.html) | Obszary doradztwa |
| `lukaszszukalski.pl/kontakt/` | [public/kontakt/index.html](public/kontakt/index.html) | Kontakt |
| `lukaszszukalski.pl/basket/` | [public/basket/index.html](public/basket/index.html) | Strona tymczasowa na Cloudflare |
| `lukaszszukalski.pl/dozobaczenia/` | [public/dozobaczenia/index.html](public/dozobaczenia/index.html) | Rezerwowy szkic; istniejąca strona działa na dotychczasowym hostingu |
| `lukaszszukalski.pl/rekomendacje/` | [public/rekomendacje/index.html](public/rekomendacje/index.html) | Strona tymczasowa na Cloudflare |
| `lukaszszukalski.pl/seeyoulater/` | [public/seeyoulater/index.html](public/seeyoulater/index.html) | Strona tymczasowa na Cloudflare |
| `lukaszszukalski.pl/ofe/` | [public/ofe/index.html](public/ofe/index.html) | Strona tymczasowa na Cloudflare |

Plik `public/dozobaczenia/index.html` to szkic. Treść produkcyjną pod `/dozobaczenia/` obsługuje wcześniejszy serwer. Stary adres `/rekomendacja/` (liczba pojedyncza) również pozostaje na wcześniejszym serwerze; `/rekomendacje/` to osobna, nowa podstrona.

## Pozostałe pliki

| Plik | Przeznaczenie |
| --- | --- |
| [src/worker.mjs](src/worker.mjs) | Kod Workera obsługującego routing i pliki statyczne |
| [cloudflare.config.ts](cloudflare.config.ts) | Konfiguracja Workera dla Cloudflare CLI (`cf`) |
| [vite.config.ts](vite.config.ts) | Budowanie kodu i dołączanie wszystkich plików z `public` |
| [package.json](package.json) | Polecenia projektu i wersje narzędzi |
| [deployment.json](deployment.json) | Opis wdrożenia przez Cloudflare API, ustawień zasobów i tras |
| [deployment-receipt.json](deployment-receipt.json) | Zapis identyfikatorów i zakresu wdrożenia z 18 listopada 2026 r. |
| [tests/routing.test.mjs](tests/routing.test.mjs) | Testy tras, przekierowań oraz zachowania dotychczasowego hostingu |
| [README.txt](README.txt) | Instrukcja dołączona do pierwotnej paczki projektu |

## Przeglądanie i edycja na GitHubie

1. Otwórz folder `public`.
2. Otwórz folder wybranej podstrony, np. `basket`.
3. Kliknij `index.html`, aby zobaczyć kod.
4. Użyj przycisku edycji pliku i zapisz zmianę jako commit.

Repozytorium przechowuje źródła oraz historię zmian. **Zapisanie commita na gałęzi `main` automatycznie uruchamia testy, budowanie i wdrożenie do Cloudflare.** Połączenie Workers Builds jest włączone dla projektu `lukaszszukalski-strony`.

## Hosting i wdrożenie

Projekt Cloudflare Workers ma nazwę `lukaszszukalski-strony`. Pliki z `public` są publikowane jako Workers Static Assets z powiązaniem `ASSETS`.

Worker jest podłączony do następujących tras:

- `lukaszszukalski.pl/*` — strona główna, `/obszary/` i `/kontakt/`
- `www.lukaszszukalski.pl/basket*`
- `lukaszszukalski.pl/basket*`
- `lukaszszukalski.pl/rekomendacje*`
- `lukaszszukalski.pl/seeyoulater*`
- `lukaszszukalski.pl/ofe*`

Kod dodatkowo sprawdza granice nazw podstron, dzięki czemu np. `/basketball` nie jest traktowane jako `/basket/`. Pozostałe adresy obsługuje dotychczasowy serwer. Adres `workers.dev` jest wyłączony. Istniejące rekordy DNS i ustawienia poczty zostały zachowane.

`deployment.json` jest opisem konfiguracji użytej przy wdrożeniu przez API. **Nie jest plikiem konfiguracyjnym CLI ani samodzielnym skryptem wdrożeniowym.** Wartość `main_module: "worker.mjs"` oznacza nazwę modułu przesyłanego do API; plik źródłowy znajduje się w `src/worker.mjs`.

Do dalszej pracy z CLI służy `cloudflare.config.ts`. Określa nazwę Workera, trasy oraz ustawienia Static Assets i obserwowalności. Vite pobiera pliki statyczne z katalogu `public`.

## Publikowanie z GitHuba

Aktywne połączenie: repozytorium `pmusiel57-ui/lukaszszukalski_pl`, gałąź `main`, istniejący Worker `lukaszszukalski-strony`. Repozytorium jest dostępne integracji Cloudflare, a klucz wdrożeniowy pozostaje zapisany w Cloudflare.

Ustawienia Workers Builds:

| Ustawienie | Wartość |
| --- | --- |
| Gałąź produkcyjna | `main` |
| Katalog projektu | `/` |
| Polecenie budowania | `npm test && npm run build` |
| Polecenie wdrożenia | `npm run deploy -- --prebuilt --mode production` |
| Node.js | Wersja wskazana w `.node-version` |

Cloudflare uruchamia wdrożenie po zmianie dowolnego pliku na `main`. Błąd testów lub budowania zatrzymuje proces przed krokiem publikacji. Automatyczne wdrażanie innych gałęzi i podglądy wersji są wyłączone.

## Zmiany z ChatGPT

Podaj adres podstrony i opisz oczekiwaną zmianę, np. „Na `/basket/` zmień nagłówek i opublikuj”. Przy edycji należy pobrać aktualny plik z GitHuba, zapisać zmianę w tym repozytorium na `main`, a następnie sprawdzić wynik Workers Builds i działającą podstronę.

GitHub jest miejscem przechowywania źródeł. Cloudflare buduje i publikuje ich wdrożoną kopię; ręczne kopiowanie plików przez panel nie jest potrzebne.

Kod Workera zawiera listę sekcji obsługiwanych przez Cloudflare. Przeniesienie `/dozobaczenia/` wymaga docelowych treści i dodania tej sekcji do listy.

## Praca lokalna

Użyj wersji Node.js zapisanej w `.node-version`, a następnie zainstaluj zależności:

```sh
npm ci
```

Polecenia projektu:

- `npm test` — testy obecnego routingu.
- `npm run build` — budowanie plików do wdrożenia.
- `npm run check:deploy` — przygotowanie i walidacja wdrożenia bez publikacji.
- `npm run dev` — lokalny podgląd projektu.
- `npm run deploy` — publikacja do istniejącego Workera; wymaga uwierzytelnienia Cloudflare.

Pliki środowiskowe i poświadczenia nie należą do repozytorium. Dane potrzebne do wdrażania należy skonfigurować w Cloudflare lub lokalnym środowisku narzędzi.

## Dodawanie docelowej treści

1. Zastąp odpowiedni plik `public/<nazwa>/index.html` docelowym HTML.
2. Grafiki, CSS i JavaScript umieszczaj wewnątrz folderu tej podstrony, np. `public/basket/assets/portret.webp`. W HTML używaj odwołań względnych, np. `./assets/portret.webp`. Globalne `/assets/` nie jest objęte obecnymi trasami Workera.
3. Szkice mają `noindex` zarówno w HTML, jak i w nagłówku `X-Robots-Tag` ustawianym przez Workera. Przy publikacji gotowej strony dostosuj obie warstwy dla tej konkretnej podstrony, zachowując `noindex` dla pozostałych szkiców.
4. Przy kolejnym wdrożeniu manifest Static Assets musi zawierać wszystkie potrzebne pliki projektu, również te bez zmian.
5. Wdróż kod i komplet zasobów do istniejącego Workera, a następnie sprawdź adres podstrony, przekierowania i grafiki.

## Testy

W katalogu projektu uruchom:

```sh
node --test tests/routing.test.mjs
```

Testy routingu działają bez instalacji dodatkowych pakietów.

## Dokumentacja Cloudflare

- [Worker Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [Direct upload of Static Assets](https://developers.cloudflare.com/workers/static-assets/direct-upload/)
- [Obsługa adresów HTML](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Workers Builds i integracja z Git](https://developers.cloudflare.com/workers/ci-cd/builds/)
