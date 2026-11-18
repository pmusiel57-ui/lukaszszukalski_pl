STRUKTURA LUKASZSZUKALSKI.PL — 18.11.2026

To jest szkielet do dalszego rozwijania osobnych podstron, a nie gotowe treści marketingowe.

PLIKI
public/index.html                     — rezerwa na stronę główną; nie zastępuje obecnej
public/basket/index.html              — nowa strona tymczasowa /basket/
public/dozobaczenia/index.html        — rezerwa; działające /dozobaczenia/ pozostaje u obecnego operatora
public/rekomendacje/index.html        — nowa strona tymczasowa /rekomendacje/
public/seeyoulater/index.html         — nowa strona tymczasowa /seeyoulater/
public/ofe/index.html                 — nowa strona tymczasowa /ofe/
src/worker.mjs                       — obsługa nowych ścieżek
deployment.json                      — konfiguracja API i dokładny zakres tras

WDROŻENIE
Jeden projekt Cloudflare Workers: lukaszszukalski-strony.
Pliki są przechowywane jako Workers Static Assets, w powyższych katalogach.
Projekt obsługuje cztery nowe ścieżki. Strona główna, /dozobaczenia/,
/rekomendacja/ i wszystkie pozostałe adresy wciąż korzystają z poprzedniego hostingu.
To etapowe przygotowanie struktury, nie pełne przeniesienie dotychczasowego serwisu.
Nie zmieniano rekordów DNS ani ustawień poczty. Adres workers.dev jest wyłączony.

JAK DODAĆ DOCELOWĄ PODSTRONĘ
1. Zastąp index.html w odpowiednim katalogu.
2. Grafiki, CSS i JS umieszczaj w tym samym katalogu lub w jego podkatalogu assets/.
   W HTML odwołuj się do nich względnie, np. ./assets/portret.webp.
   Globalne /assets/ nie jest objęte obecnymi trasami Workera.
3. Usuń meta robots noindex oraz stosowną politykę X-Robots-Tag w Workerze,
   jeżeli gotowa strona ma być indeksowana. Nie usuwaj noindex z pozostałych szkiców.
4. Do nowego manifestu Static Assets dodaj wszystkie potrzebne pliki projektu,
   również te, które nie zmieniły się od poprzedniej wersji.
5. Wdróż całą wersję plików i kodu do tego samego Workera.
6. Sprawdź adres z końcowym /, bez /, parametry UTM i lokalne pliki.

STRONA GŁÓWNA I DOZOBACZENIA
Nie kieruj domeny głównej na plik rezerwowy. Najpierw potrzebne są docelowe pliki
strony głównej. Migracja /dozobaczenia/ wymaga kompletnego HTML i jego zasobów.
Wcześniejszy adres /rekomendacja/ jest w liczbie pojedynczej. Pozostawiono go bez
zmian; nowa /rekomendacje/ jest osobnym katalogiem zgodnie z aktualnym żądaniem.

WYCOFANIE NOWYCH TRAS
Usuń wyłącznie cztery Worker Routes wymienione w deployment.json. Ruch do tych
adresów ponownie trafi do poprzedniego serwera. Nie usuwaj DNS domeny.

SPRAWDZENIE KODU
node --test tests/routing.test.mjs

ŹRÓDŁA TECHNICZNE
https://developers.cloudflare.com/workers/configuration/routing/routes/
https://developers.cloudflare.com/workers/static-assets/direct-upload/
https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
