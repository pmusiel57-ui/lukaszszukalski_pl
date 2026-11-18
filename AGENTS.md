# Praca z projektem lukaszszukalski.pl

## Źródło i publikacja

- Aktualnym źródłem projektu jest prywatne repozytorium `pmusiel57-ui/lukaszszukalski_pl`, gałąź `main`.
- Przed edycją pobierz bieżącą wersję odpowiednich plików z repozytorium. Zachowuj zmiany użytkownika i innych współpracowników.
- Użytkownik chce zlecać zmiany przez ChatGPT. Zapis zleconej zmiany na `main` uruchamia automatyczne testy, budowanie i publikację w Cloudflare Workers Builds.
- Po zapisie sprawdź wynik wdrożenia dla dokładnego SHA commita. Błąd wdrożenia oznacza, że zmiana nie została jeszcze opublikowana.
- Po udanym wdrożeniu sprawdź zmienioną podstronę. W odpowiedzi podaj jej adres i krótko opisz wynik.
- Nie przechowuj tokenów, haseł ani plików środowiskowych w repozytorium. Uwierzytelnianiem procesu wdrożenia zarządza Cloudflare.

## Pliki stron

- Strona główna: `public/index.html`.
- Podstrony: `public/basket/index.html`, `public/dozobaczenia/index.html`, `public/rekomendacje/index.html`, `public/seeyoulater/index.html`, `public/ofe/index.html`.
- Grafiki, CSS i JavaScript danej podstrony umieszczaj w jej katalogu, np. `public/basket/assets/`. Odwołuj się względnie, np. `./assets/portret.webp`.
- `src/worker.mjs` ogranicza obsługę do wybranych sekcji. Globalne `/assets/` nie jest objęte obecnymi trasami.

## Obecny zakres produkcyjny

Cloudflare Worker `lukaszszukalski-strony` obsługuje stronę główną, `/obszary/`, `/kontakt/`, `/basket/`, `/rekomendacje/`, `/seeyoulater/` i `/ofe/`.

Plik `/dozobaczenia/` jest rezerwowym szkicem. Tę ścieżkę, stary adres `/rekomendacja/` i inne ścieżki spoza listy nadal obsługuje wcześniejszy hosting. Trasa `lukaszszukalski.pl/*` pozwala obsłużyć stronę główną z parametrami zapytania. Worker przekazuje niewymienione ścieżki do dotychczasowego serwera.

Przy zmianach pojedynczej sekcji zachowuj pozostałe trasy i dotychczasowe treści. Nie rozszerzaj zakresu routingu na całą domenę w ramach zwykłej edycji jednej podstrony.

Szkice mają `noindex` w HTML i w nagłówkach Workera. Gdy gotowa sekcja ma być indeksowana, dostosuj obie warstwy dla tej sekcji.

## Narzędzia i sprawdzenie zmian

- Projekt używa Cloudflare CLI `cf`, konfiguracji `cloudflare.config.ts` i Vite. Nie dodawaj równoległej konfiguracji Wrangler.
- Używaj Node.js z `.node-version` oraz zależności z `package-lock.json`; instalacja: `npm ci`.
- `npm test` sprawdza routing i zachowanie ścieżek starego hostingu.
- `npm run build` buduje Workera i komplet zasobów statycznych.
- `npm run check:deploy` przygotowuje i sprawdza wdrożenie bez publikowania.
- Zmiany konfiguracji wdrożenia sprawdzaj lokalnym dry-run. Dla zmian wyglądu lub treści sprawdź odpowiedni widok strony. Nie dopisuj testów odtwarzających jedynie treść prostych edycji.
- Produkcyjna komenda Workers Builds to `npm run deploy -- --prebuilt --mode production`, wykonywana po `npm test && npm run build`.
- Zachowuj zwykłą kontrolę konfliktów wdrożenia. Nie dodawaj trwale `--force` do polecenia publikacji.
- `deployment.json` oraz `deployment-receipt.json` opisują pierwotne wdrożenie przez API. Aktualną konfiguracją narzędzi jest `cloudflare.config.ts`.
