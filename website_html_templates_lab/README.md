# Beyond — PlayMusicPrompts Listening Lab

Yeni, bağımsız 3D player: **http://127.0.0.1:4175/player-three.html**. Bu klasördeki **START-PLAYER.cmd** ile açılır. Onaylanan `website_html_templates` sürümü ve 4173 adresindeki player ayrı kalır; Lab kendi tarayıcı kayıtlarını kullanır.

- **Tidal:** müziğin düşük frekansları ve ataklarıyla hareket eden üç boyutlu okyanus, ışıklı tutulma ve yüzey yansımaları.
- **Monolith:** katı mimari kütleler, basamaklar ve müziğe tepki veren hareketli açıklıklar.
- **Aether:** derinlik boyunca uzanan parçacık akımları ve hacimsel ışık. Uyumlu cihazlarda parçacık konumları GPU üzerinde hesaplanır.
- **Shape this world → World:** her dünya için üç hareket biçimi; akış, genişleme, türbülans, ışık, atmosfer ve kamera yolculuğu. Motion kapatıldığında otomatik hareket durur.
- **Visuals → Director → Score:** bir şarkının belirli anlarına dünya ve görünüm kaydı ekle. Oynatma konumunu değiştirmek ilgili kaydı uygular; bir ayarı elle değiştirmek kontrolü sana verir.
- **Save frame:** gerçek 3D kareyi PNG olarak bu klasörün `captures` altına kaydeder ve önizler. Arayüz görüntüye dahil edilmez.
- **Collection:** önceki dört sahne de kopyanın içinde erişilebilir. Dokuz atmosfer paleti ve ses/oturum araçları korunur.

**Bring your sound** ile yerel müzik ekle, ardından Play'e bas. Ses dosyaları bu cihazda kalır. Sabit kare hızı veya tüm cihazlarda aynı grafik kalitesi vaat edilmez; Visuals → Look → Rendering quality içindeki Battery friendly seçeneği gerçek çizim ve hesaplama yükünü azaltır. Masaüstü 1280×720 ve dar ekran 390×844 yerleşimleri gerçek tarayıcıda incelendi; bu bir fiziksel telefon GPU testi değildir.

## Kopyalanan HTML sayfaları

Onaylanan beş ekranın İngilizce, responsive HTML uygulaması. Dosyalar bu klasörden bağımsız olarak başka bir dizine taşınabilir; sayfaların çalışması için bir paket kurulumu gerekmez.

## Açılış

Windows’ta **START.cmd** dosyasını aç. Yerel önizleme: **http://127.0.0.1:4175**. Bu bilgisayardaki Node.js veya Codex ile gelen Node.js otomatik bulunur.

Alternatif: bu klasörde `node server.mjs` çalıştır. Sayfaları doğrudan dosya olarak açmak da mümkündür; sayfa geçişinde sesin kesilmemesi için yerel sunucuyu kullan.

| Sayfa | Dosya |
| --- | --- |
| Create / ana sayfa | `index.html` |
| Login | `login.html` |
| Explore | `explore.html` |
| Radio | `radio.html` |
| Library | `library.html` |

## Çalışan deneyimler

- Ortak gezinme, tarayıcı geri/ileri, global şarkı/istasyon/mood araması.
- Büyüyen prompt, düzenlenebilir Enhance önerisi, altı hızlı seçim, enerji ve **100 request parametresi** için All controls. Seçenekler proje sözlüklerinden: 2.196 genre, 114 mood, 14 era, 1.057 instrument.
- Genre/Mood/Era keşfi, istasyon filtreleri, World/Classic görünümü ve sürükleme/oklarla istasyon dolaşımı.
- Kaydetme/kaldırma/geri alma, arama/sıralama, playlist oluşturma, isim değiştirme, silme ve playlist’e şarkı ekleme/çıkarma. Kütüphane boş başlar; kayıtlar bu tarayıcıda tutulur.
- Gerçek HTML audio: oynat/duraklat, ileri/geri, kuyruk, shuffle, repeat, seek, ses düzeyi, genişletilmiş player, Media Session. Sayfalar arasında **aynı audio öğesi** korunur.
- Ses dosyası ekleme; dosyalar IndexedDB’de bu cihazda tutulur. Bir kapaktaki Play düğmesi, ona ses dosyası bağlamayı da sunar. Dalga biçimi gerçek dosyadan hesaplanır; uzaktaki sunucu CORS izni vermiyorsa çalışır ilerleme çizgisi kullanılır.
- Login doğrulaması, parola görünürlüğü, Google/Amazon/Apple, kayıt ve parola sıfırlama ekranları. Bağlantı yoksa gerçekçi bir “bu önizlemede kullanılamıyor” durumu gösterilir.
- Masaüstü, tablet, mobil düzenler; klavye ile tab gezinmesi, native dialog, görünür focus, reduced-motion desteği.

## Canlı servis sınırı

Bu teslimat **yerel HTML şablonları ve çalışan frontend** kapsamındadır. Gerçek müzik üretimi, hazır katalog sesleri, hesap sunucusu, OAuth ve otomatik devam üretimi bağlı değildir. Projede yerel müzik dosyası bulunmadı. Örnek kapaklar ve şarkı adları onaylanan tasarım içeriğidir; çalıyormuş, üretilmiş veya hesaba kaydedilmiş gibi gösterilmez.

Player boş ve duraklatılmış başlar. “Next song ready” yalnız oynatılabilir bir sonraki öğe gerçekten kuyruğa girdiğinde görünür. Üretim göstergeleri yalnız çağrılan adapter beklenirken gösterilir. Browser autoplay engellerse kullanıcı Play düğmesine basabilir.

Tarayıcı testlerinde kullanılan kısa test tonu izole test oturumunda oluşturulur; siteyle örnek müzik olarak dağıtılmaz.

## Service adapters

Edit `config.js`. This file is public: **never place service secrets in it**. Connect these callbacks to your existing server, which should manage secrets, sessions and authorization.

```js
window.PMP_CONFIG = {
  catalog: [
    // Actual, playable catalog records supplied by your service:
    // { id, title, url, art, genre, mood, era, stationId, shareUrl }
  ],
  adapters: {
    generate: null,       // async (payload, {signal}) => track
    enhance: null,        // async (originalPrompt, draft) => string
    continue: null,       // async ({current, history, preferences}) => track
    signIn: null,         // async ({email, password}) => {user}
    signUp: null,         // async ({email, password}) => {message}
    resetPassword: null,  // async ({email}) => result
    provider: null        // async ('google'|'amazon'|'apple') => {user} or {redirected:true}
  },
  links: { privacy: null, terms: null, help: null }
};
```

A `track` must contain a playable `url` and `title`; optional fields include `id`, `art`, `genre`, `mood`, `era`, `shareUrl`, `stationId` and `stationIds`. Existing illustration IDs are `night`, `hours`, `violet`, `coast`, `lights`, `ferry`. Use matching IDs to supply their actual catalog audio. Artwork keys additionally include `focus`, `glow`, `morning`, `rest`, `energy`.

Generation adapters must honor `AbortSignal` and resolve only when the returned track is playable. Map your service’s response envelope, polling and error codes in the adapter. Creating while music plays inserts the returned song immediately after the current song. Keep it going opts into `continue`; disabling it preserves manually queued music. A Radio station repeats its configured playable catalog; generated continuation requires the separate enabled callback.

Authentication callbacks deliberately contain no local password database or simulated successful login. Enforce account policies on your server. Local Library state is not cloud account synchronization; connect server-side library persistence as part of the production integration.

## Full control contract

`schema.js` and `assets/control-schema.json` contain the source-derived parameter metadata. `controls.js` builds native controls, repeatable structure/reference/energy rows, selectable vocabularies, numeric ranges, labels and nested objects. `PMPControls.payload(draft)` returns only the 100 request keys, preserves typed enum values, checks documented constraints, removes inactive conditional fields, and rejects server-assigned `project.track_id`. The three response-only fields (`rights`, `compliance`, `analysis_outputs`) are excluded from input controls.

Source: project `docs/api/04-request-body-full.md`, plus the local music-studio vocabularies. This is the checked-in contract snapshot, not a live capabilities response. Two upstream metadata gaps remain explicit in the schema: the complete current tempo range and the full 109-code language list were absent locally. Tempo accepts numeric input and language accepts a code with 11 local suggestions. Retrieve current capabilities before enforcing these membership/range limits in production. Service-side semantic, rights, language and content checks remain authoritative.

## Files and maintenance

- `styles.css`: shared visual system, responsive layouts, controls and artwork framing.
- `app.js`: shared state, modal, navigation and event routing.
- `player.js`: real audio, queue, local audio storage and continuation callbacks.
- `collections.js`: Explore, Radio filters, search and Library.
- `controls.js`: full parameter editor and serialization.
- `experience.js`: composer, authentication screens, World navigation and page initialization.
- `scripts/build.mjs`: shared HTML source and page compositions; `node scripts/build.mjs` regenerates the five HTML files and favicon.
- `assets/`: all artwork and local Inter font. `assets/asset-manifest.json` records provenance; Inter’s license is included.
- `verification/`: browser checks and desktop/tablet/mobile screenshots. Screenshots can include deliberately changed test state. `library-populated-desktop.png` shows six songs saved through the real interface.

Browser QA scripts use the Playwright installation already in this project’s research tools. They are not runtime dependencies. If moving the templates elsewhere, use your own Playwright installation to rerun these optional scripts. The HTML and local preview need only a modern browser and Node.js.

No production files were restored, no deployment was performed and no billable music generation was called.
