# Expo - Reverse Geocoding

## 1. Cel aplikacji

Celem aplikacji jest demonstracja pobierania danych lokalizacyjnych z urządzenia mobilnego oraz ich przetwarzania w celu uzyskania czytelnego adresu użytkownika.  
Aplikacja realizuje funkcjonalność konwersji współrzędnych geograficznych (GPS) na opisowy adres przy użyciu publicznego API.

Użyta została strona https://snack.expo.dev/ ponieważ codesandbox miał problemy z poprawnym działaniem Expo Go

---

## 2. Zakres funkcjonalny

Aplikacja realizuje następujące funkcje:

- pobranie aktualnej lokalizacji użytkownika (GPS),
- uzyskanie zgody użytkownika na dostęp do lokalizacji,
- wykonanie zapytania typu reverse geocoding,
- prezentacja:
  - współrzędnych geograficznych,
  - pełnego adresu,
  - skróconego opisu lokalizacji,
- obsługa błędów oraz stanów wyjątkowych (brak zgody, brak danych, błąd API).

---

## 3. Dane z urządzenia

W projekcie wykorzystano dane pochodzące z urządzenia mobilnego:

- współrzędne GPS (szerokość i długość geograficzna),
- system uprawnień lokalizacji użytkownika.

Źródło danych:
- biblioteka: `expo-location`

Wykorzystane funkcje:
- `requestForegroundPermissionsAsync()` - obsługa uprawnień,
- `getCurrentPositionAsync()` - pobranie aktualnej pozycji urządzenia.

---

## 4. Zewnętrzne API

W projekcie wykorzystano publiczne API OpenStreetMap Nominatim.

### Reverse Geocoding API

- endpoint: https://nominatim.openstreetmap.org/reverse

### Przykładowe zapytanie:

https://nominatim.openstreetmap.org/reverse?lat=50.30&lon=19.13&format=jsonv2&addressdetails=1

### Zakres wykorzystania API:
- konwersja współrzędnych GPS na adres tekstowy,
- zwracanie struktury adresowej (ulica, miasto, region, kraj).

---

## 5. Przepływ danych w aplikacji

Proces przetwarzania danych przebiega w następujących krokach:

1. Uruchomienie aplikacji i inicjalizacja komponentu.
2. Wysłanie żądania o dostęp do lokalizacji użytkownika.
3. Po uzyskaniu zgody:
   - pobranie aktualnych współrzędnych GPS.
4. Wysłanie zapytania HTTP do API Nominatim.
5. Otrzymanie odpowiedzi zawierającej dane adresowe.
6. Przetworzenie danych:
   - wygenerowanie pełnego adresu,
   - wygenerowanie skróconego opisu lokalizacji.
7. Wyświetlenie danych w interfejsie użytkownika.

---

## 6. Technologie i biblioteki

Projekt został zrealizowany z wykorzystaniem:

- React Native (Expo),
- `expo-location` (GPS i system uprawnień),
- Fetch API (komunikacja HTTP),
- AbortController (obsługa timeoutów),
- React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).

---

## 7. Obsługa błędów i ograniczeń

Aplikacja uwzględnia następujące scenariusze błędów:

### 7.1 Brak zgody użytkownika
- aplikacja przechodzi w stan błędu,
- wyświetlany jest komunikat o odmowie dostępu.

### 7.2 Błędy API
- obsługa kodów HTTP (w tym 403 i błędów serwera),
- walidacja odpowiedzi API.

### 7.3 Timeout zapytania
- zastosowanie `AbortController` w celu przerwania zapytania po określonym czasie.

### 7.4 Ograniczenia API Nominatim
- publiczne API posiada limity zapytań,
- możliwe czasowe blokady przy nadmiernym użyciu.

### 7.5 Zależność od sygnału GPS
- dokładność oraz dostępność danych zależy od warunków urządzenia.

---

## 8. Architektura i przepływ logiczny

Logika aplikacji została podzielona na następujące etapy:

- `getLocation()` - pobranie lokalizacji i obsługa uprawnień,
- `reverseGeocode()` - komunikacja z API i pobranie danych adresowych,
- `load()` - kontrola całego procesu oraz zarządzanie stanem aplikacji.

Zastosowano mechanizm ochrony przed równoległymi zapytaniami (`requestIdRef`), aby uniknąć wyścigu stanów (race condition).

---

## 9. Podsumowanie

Aplikacja stanowi demonstrację integracji danych urządzenia mobilnego z zewnętrznym API.  
Realizuje pełny cykl przetwarzania danych lokalizacyjnych: od pobrania sygnału GPS, przez przetwarzanie w API, aż do prezentacji danych użytkownikowi w czytelnej formie.

Projekt spełnia wymagania dotyczące:
- wykorzystania danych z urządzenia,
- użycia publicznego API,
- obsługi błędów i uprawnień,
- prezentacji danych w interfejsie użytkownika.
