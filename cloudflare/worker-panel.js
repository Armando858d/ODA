// cloudflare/src/catalog-seed.mjs
var catalog_seed_default = [
  { id: "venom-001", name: "Figura Venom", description: "Figura s\xF3lida con recubrimiento de exhibici\xF3n. Acabado profesional monocolor.", category: "art-toy", type: "fixed", price: 850, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 350 }], image: "ven1.png", tags: ["ACABADO PRO", "COLECCI\xD3NABLE"], weight: 180, featured: true },
  { id: "elefante-002", name: "Elefante Art Toy", description: "Pieza decorativa con dise\xF1o organico. Acabado liso tipo inyeccion.", category: "art-toy", type: "fixed", price: 650, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 300 }], image: "elefante1.png", tags: ["DECORATIVO", "PREMIUM"], weight: 220, featured: true },
  { id: "snoopy-003", name: "Snoopy Figure", description: "R\xE9plica artesanal de alta fidelidad con acabado de exhibici\xF3n.", category: "figura", type: "fixed", price: 450, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 300 }], image: "snoppy.png", tags: ["FIGURA", "DETALLADO"], weight: 150, featured: false },
  { id: "hello-004", name: "Hello Kitty", description: "Figura decorativa con dise\xF1o cute. Perfecta para regalo.", category: "figura", type: "fixed", price: 400, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 300 }], image: "hello1.png", tags: ["REGALO", "CUTE"], weight: 120, featured: false },
  { id: "gato-005", name: "Gato Sentado", description: "Art Toy minimalista con acabado premium. Edici\xF3n de estudio.", category: "art-toy", type: "fixed", price: 350, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 250 }], image: "cat-sit.png", tags: ["ART TOY", "MINIMALISTA"], weight: 130, featured: false },
  { id: "conejo-006", name: "Conejo Decorativo", description: "Pieza decorativa con textura org\xE1nica y acabado brillante.", category: "art-toy", type: "fixed", price: 380, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 270 }], image: "conejo1.png", tags: ["DECORATIVO", "ORG\xC1NICO"], weight: 160, featured: false },
  { id: "corazon-007", name: "Coraz\xF3n Anat\xF3mico 3D", description: "Art Toy custom de coleccion. Pieza anat\xF3mica detallada.", category: "art-toy", type: "fixed", price: 550, variants: [{ name: "Sin pintar", mod: 0 }, { name: "Pintado a mano", mod: 350 }], image: "corazon1.png", tags: ["COLECCI\xD3N", "ANAT\xD3MICO"], weight: 200, featured: true },
  { id: "regalo-008", name: "Regalo Personalizado", description: "Pieza exclusiva dise\xF1ada a tu medida. Edici\xF3n \xFAnica irrepetible.", category: "custom", type: "custom", price: null, variants: [], image: "sen1.png", tags: ["EXCLUSIVO", "PERSONALIZADO"], weight: null, featured: false },
  { id: "recuerdo-009", name: "Recuerdo Inolvidable", description: "Escultura personalizada con calidad de exhibici\xF3n profesional.", category: "custom", type: "custom", price: null, variants: [], image: "bebe1.png", tags: ["RECUERDO", "PREMIUM"], weight: null, featured: false },
  { id: "muneca-010", name: "Mu\xF1eca Personalizada", description: "Coleccionable custom con nivel de detalle artesanal.", category: "custom", type: "custom", price: null, variants: [], image: "elena1.png", tags: ["CUSTOM", "DETALLADO"], weight: null, featured: false },
  { id: "retrato-011", name: "Retrato 3D", description: "Pieza de exhibici\xF3n \xFAnica basada en fotograf\xEDa real.", category: "custom", type: "custom", price: null, variants: [], image: "mujer1.png", tags: ["RETRATO", "\xDANICO"], weight: null, featured: false },
  { id: "centro-012", name: "Centro de Mesa XV A\xF1os", description: "Producci\xF3n a medida para eventos. Dise\xF1o exclusivo.", category: "custom", type: "custom", price: null, variants: [], image: "jan1.png", tags: ["EVENTO", "PRODUCCI\xD3N"], weight: null, featured: false },
  { id: "angel-013", name: "\xC1ngel 3D", description: "Escultura art\xEDstica con alas detalladas. Pieza de exhibici\xF3n.", category: "custom", type: "custom", price: null, variants: [], image: "angel1.png", tags: ["ARTE", "EXHIBICION"], weight: null, featured: false },
  { id: "lampara-014", name: "L\xE1mpara de Regalo", description: "Pieza funcional con iluminaci\xF3n integrada. Dise\xF1o decorativo.", category: "custom", type: "custom", price: null, variants: [], image: "jan2.png", tags: ["FUNCIONAL", "ILUMINACI\xD3N"], weight: null, featured: false }
];

// cloudflare/src/errors.mjs
var APIError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};

// cloudflare/src/content.mjs
var q = (e, s, ...v) => e.DB.prepare(s).bind(...v);
async function getContent(e) {
  const r = await q(e, "SELECT value FROM store_settings WHERE key='content'").first();
  return r ? JSON.parse(r.value) : { revision: 0, products: catalog_seed_default, collections: [], promotions: [] };
}
function activePromotions(c, time = Date.now()) {
  return c.promotions.filter((x) => x.active && (!x.start || Date.parse(x.start) <= time) && (!x.end || Date.parse(x.end) > time));
}
function pricedProducts(c, time = Date.now()) {
  const offers = activePromotions(c, time);
  return c.products.filter((p) => p.active !== false).map((p) => {
    const promo = offers.filter((x) => !x.collection || p.collection === x.collection).sort((a, b) => b.percent - a.percent)[0];
    const rate = 1 - (promo?.percent || 0) / 100;
    return { ...p, originalPrice: p.price, price: p.price === null ? null : Math.round(p.price * rate * 100) / 100, variants: p.variants.map((v) => ({ ...v, mod: Math.round(v.mod * rate * 100) / 100 })), promotion: promo?.title || "" };
  });
}
var bad = (m) => {
  throw new APIError(400, m);
};
function text(x, max = 200) {
  if (typeof x !== "string" || x.length > max || /[<>]/.test(x)) bad("Revisa los textos: no se admite HTML.");
  return x.trim();
}
function image(x) {
  if (typeof x !== "string" || x.length > 19e4 || !(/^[a-zA-Z0-9_.-]+$/.test(x) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(x) || /^https:\/\/[^\s"'<>]+$/.test(x))) bad("Imagen no v\xE1lida. Usa JPG, PNG, WebP o una URL HTTPS.");
  return x;
}
function validateContent(b) {
  if (!b || !Number.isInteger(b.revision) || !Array.isArray(b.products) || !Array.isArray(b.collections) || !Array.isArray(b.promotions) || b.products.length > 100 || b.collections.length > 40 || b.promotions.length > 40) bad("Contenido no v\xE1lido o demasiado grande.");
  const ids = /* @__PURE__ */ new Set();
  const id = (x) => {
    if (typeof x !== "string" || !/^[-a-z0-9]{1,60}$/.test(x) || ids.has(x)) bad("Identificador repetido o no v\xE1lido.");
    ids.add(x);
    return x;
  };
  const collections = b.collections.map((x) => ({ id: id(x.id), name: text(x.name, 80), description: text(x.description || "", 400), image: image(x.image), active: !!x.active }));
  const products = b.products.map((x) => {
    if (!["fixed", "custom"].includes(x.type) || !["art-toy", "figura", "custom", "lienzo"].includes(x.category) || !Array.isArray(x.variants) || x.variants.length > 8 || x.type === "fixed" && (!Number.isFinite(x.price) || x.price < 1 || x.price > 1e6 || !x.variants.length)) bad("Revisa el precio y los acabados.");
    if (x.collection && !collections.some((c) => c.id === x.collection)) bad("Colecci\xF3n no encontrada.");
    return { id: id(x.id), name: text(x.name, 100), description: text(x.description || "", 1500), category: x.category, type: x.type, price: x.type === "custom" ? null : x.price, variants: x.variants.map((v) => {
      if (!Number.isFinite(v.mod) || v.mod < 0 || v.mod > 1e6) bad("Precio adicional no v\xE1lido.");
      return { name: text(v.name, 80), mod: v.mod };
    }), image: image(x.image), images: (x.images || []).slice(0, 4).map(image), tags: [], featured: !!x.featured, active: x.active !== false, collection: x.collection || "" };
  });
  const promotions = b.promotions.map((x) => {
    if (!Number.isFinite(x.percent) || x.percent < 1 || x.percent > 90) bad("El descuento debe estar entre 1 y 90%.");
    if (x.collection && !collections.some((c) => c.id === x.collection)) bad("Colecci\xF3n de promoci\xF3n no encontrada.");
    for (const k of ["start", "end"]) if (x[k] && !Number.isFinite(Date.parse(x[k]))) bad("Fecha no v\xE1lida.");
    if (x.start && x.end && Date.parse(x.end) <= Date.parse(x.start)) bad("El fin debe ser posterior al inicio.");
    return { id: id(x.id), title: text(x.title, 100), percent: x.percent, collection: x.collection || "", start: x.start || "", end: x.end || "", active: !!x.active };
  });
  const result = { revision: b.revision + 1, products, collections, promotions };
  if (JSON.stringify(result).length > 18e5) bad("El cat\xE1logo supera 1.8 MB. Reduce el n\xFAmero o tama\xF1o de las fotos.");
  return result;
}
async function saveContent(e, body) {
  const next = validateContent(body);
  await q(e, "INSERT OR IGNORE INTO store_settings(key,value) VALUES('content',?)", JSON.stringify({ revision: 0, products: catalog_seed_default, collections: [], promotions: [] })).run();
  const old = await getContent(e);
  if (old.revision !== body.revision) throw new APIError(409, "Otra sesi\xF3n modific\xF3 el cat\xE1logo. Recarga antes de guardar.");
  const commands = [q(e, "UPDATE store_settings SET value=? WHERE key='content' AND value=?", JSON.stringify(next), JSON.stringify(old))];
  for (const p of next.products) for (let i = 0; i < p.variants.length; i++) commands.push(q(e, "INSERT OR IGNORE INTO inventory(product_id,variant,stock) VALUES(?,?,0)", p.id, i));
  const result = await e.DB.batch(commands);
  if (result[0].meta.changes !== 1) throw new APIError(409, "El cat\xE1logo cambi\xF3. Recarga el panel.");
  return next;
}

// cloudflare/src/catalog.mjs
var catalog_default = [
  { "id": "venom-001", "name": "Figura Venom", "price": 850, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 350 }] },
  { "id": "elefante-002", "name": "Elefante Art Toy", "price": 650, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 300 }] },
  { "id": "snoopy-003", "name": "Snoopy Figure", "price": 450, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 300 }] },
  { "id": "hello-004", "name": "Hello Kitty", "price": 400, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 300 }] },
  { "id": "gato-005", "name": "Gato Sentado", "price": 350, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 250 }] },
  { "id": "conejo-006", "name": "Conejo Decorativo", "price": 380, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 270 }] },
  { "id": "corazon-007", "name": "Coraz\xF3n Anat\xF3mico 3D", "price": 550, "variants": [{ "name": "Sin pintar", "mod": 0 }, { "name": "Pintado a mano", "mod": 350 }] }
];

// cloudflare/src/shipping-states.mjs
var shipping_states_default = [{ "name": "Aguascalientes", "code": "AG" }, { "name": "Baja California", "code": "BC" }, { "name": "Baja California Sur", "code": "BS" }, { "name": "Campeche", "code": "CM" }, { "name": "Chiapas", "code": "CS" }, { "name": "Chihuahua", "code": "CH" }, { "name": "Ciudad de M\xE9xico", "code": "CX" }, { "name": "Coahuila", "code": "CO" }, { "name": "Colima", "code": "CL" }, { "name": "Durango", "code": "DG" }, { "name": "Guanajuato", "code": "GT" }, { "name": "Guerrero", "code": "GR" }, { "name": "Hidalgo", "code": "HG" }, { "name": "Jalisco", "code": "JA" }, { "name": "M\xE9xico", "code": "EM" }, { "name": "Michoac\xE1n", "code": "MI" }, { "name": "Morelos", "code": "MO" }, { "name": "Nayarit", "code": "NA" }, { "name": "Nuevo Le\xF3n", "code": "NL" }, { "name": "Oaxaca", "code": "OA" }, { "name": "Puebla", "code": "PU" }, { "name": "Quer\xE9taro", "code": "QT" }, { "name": "Quintana Roo", "code": "QR" }, { "name": "San Luis Potos\xED", "code": "SL" }, { "name": "Sinaloa", "code": "SI" }, { "name": "Sonora", "code": "SO" }, { "name": "Tabasco", "code": "TB" }, { "name": "Tamaulipas", "code": "TM" }, { "name": "Tlaxcala", "code": "TL" }, { "name": "Veracruz", "code": "VE" }, { "name": "Yucat\xE1n", "code": "YU" }, { "name": "Zacatecas", "code": "ZA" }];

// cloudflare/src/skydropx.mjs
var fail = (s, m) => {
  throw new APIError(s, m);
};
function skyConnection(e) {
  if (e.SKYDROPX_MODE === "live") return { host: "https://api-pro.skydropx.com", id: e.SKYDROPX_CLIENT_ID, secret: e.SKYDROPX_CLIENT_SECRET };
  if (e.SKYDROPX_MODE !== "test") return null;
  let u;
  try {
    u = new URL(e.SKYDROPX_TEST_API_URL);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.port || u.username || u.password || u.pathname !== "/" || u.search || u.hash || !u.hostname.endsWith(".skydropx.com") || !/(^|[-.])(sb|sandbox)([-.]|$)/.test(u.hostname)) return null;
  return { host: u.origin, id: e.SKYDROPX_TEST_CLIENT_ID, secret: e.SKYDROPX_TEST_CLIENT_SECRET };
}
var skyConfigured = (e) => {
  const c = skyConnection(e);
  return !!(c?.id && c?.secret);
};
var authCache = null;
async function token(e) {
  if (!skyConfigured(e)) fail(503, "Configura las claves del ambiente seleccionado y, para pruebas, la URL API indicada por Skydropx Sandbox.");
  const { host, id, secret } = skyConnection(e);
  const key = host + "\0" + id + "\0" + secret;
  if (authCache?.key === key && authCache.until > Date.now()) return authCache.token;
  const r = await fetch(host + "/api/v1/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }), signal: AbortSignal.timeout(7e3) });
  if (!r.ok) fail(502, "Skydropx no acept\xF3 las credenciales del ambiente seleccionado (HTTP " + r.status + ").");
  const d = await r.json();
  if (typeof d.access_token !== "string" || !d.access_token || !Number.isFinite(Number(d.expires_in)) || Number(d.expires_in) <= 60) fail(502, "Skydropx devolvi\xF3 una autorizaci\xF3n incompleta.");
  authCache = { key, token: d.access_token, until: Date.now() + (Math.min(Number(d.expires_in), 7200) - 60) * 1e3 };
  return d.access_token;
}
async function sky(e, path, body, capture) {
  try {
    const access = await token(e);
    const r = await fetch(skyConnection(e).host + "/api/v1/" + path, { method: body === void 0 ? "GET" : "POST", headers: { Authorization: "Bearer " + access, "Content-Type": "application/json" }, body: body === void 0 ? void 0 : JSON.stringify(body), signal: AbortSignal.timeout(7e3) });
    let d;
    try {
      d = await r.json();
    } catch {
      fail(502, "Skydropx devolvi\xF3 una respuesta no v\xE1lida.");
    }
    if (capture) await capture(d);
    if (r.status === 401) authCache = null;
    if (!r.ok) fail(502, "Skydropx HTTP " + r.status + ". Revisa la conexi\xF3n o la solicitud en tu cuenta.");
    return d;
  } catch (err) {
    if (err instanceof APIError) throw err;
    fail(503, "Skydropx no respondi\xF3 a tiempo. No se repite autom\xE1ticamente una compra de gu\xEDa.");
  }
}
async function skyCheck(e) {
  await token(e);
  return { connected: true, mode: e.SKYDROPX_MODE, note: "Autorizaci\xF3n aceptada. No se compr\xF3 ninguna gu\xEDa; falta comprobar una cotizaci\xF3n." };
}
var address = (a) => ({ country_code: "MX", postal_code: a.postalCode, area_level1: shipping_states_default.find((s) => s.code === a.state)?.name || a.state, area_level2: a.city, area_level3: a.district });
function skyRate(r) {
  const cents = Math.round(Number(r.total) * 100);
  if (r.success !== true || !["approved", "coverage_checked", "price_found_internal", "price_found_external"].includes(r.status) || r.currency_code !== "MXN" || !Number.isSafeInteger(cents) || cents <= 0 || cents > 1e7 || !r.id || !r.provider_name || !r.provider_service_code || r.requires_origin_verification || !["single", "multipackage"].includes(r.shipment_creation_type)) return null;
  return { rate_id: String(r.id), carrier: String(r.provider_name), service: String(r.provider_service_code), description: String(r.provider_display_name || r.provider_name) + " \xB7 " + String(r.provider_service_name || r.provider_service_code), total_cents: cents, estimate: Number.isInteger(r.days) && r.days > 0 ? r.days + " d\xEDas estimados" : "Consultar plazo", drop_off: r.pickup !== true };
}
async function skyOffers(from, to, packages, e) {
  const quotation = { address_from: address(from), address_to: address(to), parcels: packages.map((p) => ({ length: Math.ceil(p.dimensions.length), width: Math.ceil(p.dimensions.width), height: Math.ceil(p.dimensions.height), weight: p.weight, package_protected: false, declared_value: p.declaredValue })) };
  const initial = await sky(e, "quotations", { quotation });
  const id = initial.id || initial.quotation_id;
  if (typeof id !== "string" || !/^[-a-zA-Z0-9]+$/.test(id)) fail(502, "Falta la referencia de cotizaci\xF3n de Skydropx.");
  let result = initial;
  const deadline = Date.now() + 1e4;
  for (let n = 0; n < 5 && result.is_completed !== true && Date.now() < deadline; n++) {
    await new Promise((r) => setTimeout(r, 650));
    result = await sky(e, "quotations/" + encodeURIComponent(id));
  }
  if (result.is_completed !== true) fail(503, "Skydropx sigue calculando sus tarifas. Vuelve a cotizar en unos momentos.");
  if (!Array.isArray(result.rates)) fail(502, "Skydropx no devolvi\xF3 una lista de tarifas.");
  const seen = /* @__PURE__ */ new Set();
  return result.rates.map(skyRate).filter((r) => r && !seen.has(r.rate_id) && seen.add(r.rate_id)).map((r) => ({ ...r, payload: { provider: "skydropx", quotation_id: id, rate_id: r.rate_id, origin: from, destination: to, packages, quotation } }));
}
async function skyRefresh(payload, e) {
  const d = await sky(e, "quotations/" + encodeURIComponent(payload.quotation_id));
  if (d.is_completed !== true) fail(409, "La tarifa de Skydropx no est\xE1 confirmada.");
  const r = (d.rates || []).map(skyRate).find((r2) => r2?.rate_id === payload.rate_id);
  if (!r) fail(409, "La tarifa de Skydropx venci\xF3 o ya no est\xE1 disponible.");
  return r;
}
function skyShipment(payload, items, e) {
  let codes;
  try {
    codes = JSON.parse(e.SKYDROPX_PACKAGE_CODES || "{}");
  } catch {
    fail(409, "Revisa SKYDROPX_PACKAGE_CODES.");
  }
  const packages = [];
  for (const item of items) {
    const c = codes[item.id];
    if (!c || !/^\d{8}$/.test(c.consignment_note) || !c.package_type || !/^[A-Za-z0-9]{1,8}$/.test(c.package_type)) fail(409, "Configura Carta Porte y tipo de empaque para " + item.title + " antes de comprar la gu\xEDa.");
    for (let i = 0; i < item.quantity; i++) packages.push({ package_number: String(packages.length + 1), package_protected: false, declared_value: item.price_cents / 100, consignment_note: c.consignment_note, package_type: c.package_type });
  }
  const full = (a) => ({ ...address(a), street1: a.street + " " + a.number, name: a.name.slice(0, 30), company: a.name.slice(0, 60), phone: a.phone, email: a.email, reference: (a.reference || "").slice(0, 30) });
  return { shipment: { rate_id: payload.rate_id, unique_shipment: true, printing_format: "thermal", address_from: full(payload.origin), address_to: full(payload.destination), packages } };
}
function skyLabels(d, payload) {
  const shipment = d.data, a = shipment?.attributes;
  const total = Number(a?.total);
  if (!shipment?.id || !a || a.payment_status !== "paid" || !Number.isFinite(total) || total <= 0) return null;
  const ids = shipment.relationships?.packages?.data?.map((p) => String(p.id)) || [];
  if (ids.length !== payload.packages.length) return null;
  const labels = ids.map((id) => {
    const p = (d.included || []).find((x) => String(x.id) === id)?.attributes;
    let u;
    try {
      u = new URL(p.label_url);
    } catch {
      return null;
    }
    if (u.protocol !== "https:" || u.username || u.password || !p.tracking_number) return null;
    return { shipment_id: String(shipment.id), tracking: String(p.tracking_number), label_url: u.href, carrier: String(a.carrier_name || ""), service: "Skydropx" };
  });
  if (labels.some((x) => !x)) return null;
  return { labels, total_cents: Math.round(total * 100) };
}

// cloudflare/src/shipping.mjs
var fail2 = (status, message) => {
  throw new APIError(status, message);
};
var sql = (e, s, ...a) => e.DB.prepare(s).bind(...a);
var first = (e, s, ...a) => sql(e, s, ...a).first();
var stamp = () => Math.floor(Date.now() / 1e3);
var sha = async (value) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))].map((n) => n.toString(16).padStart(2, "0")).join("");
var enviaConfigured = (e) => !!(e.ENVIA_TOKEN && ["envia", "both"].includes(e.SHIPPING_PROVIDER) && ["test", "live"].includes(e.ENVIA_MODE));
var shippingProviders = (e) => [...enviaConfigured(e) ? ["envia"] : [], ...["skydropx", "both"].includes(e.SHIPPING_PROVIDER) && skyConfigured(e) ? ["skydropx"] : []];
var shippingConfigured = (e) => shippingProviders(e).length > 0;
var base = (e) => e.ENVIA_MODE === "live" ? "https://api.envia.com" : "https://api-test.envia.com";
function enviaToken(value) {
  let token2 = String(value || "").trim().replace(/^Bearer\s+/i, "").trim();
  if (token2.startsWith('"') && token2.endsWith('"') || token2.startsWith("'") && token2.endsWith("'")) token2 = token2.slice(1, -1).trim();
  if (!token2 || /[\s*\u2022\u25cf]/u.test(token2)) fail2(409, "El token guardado contiene espacios internos o caracteres de ocultamiento. Copia el valor completo con el boton del portapapeles de Envia.com.");
  return token2;
}
async function envia(e, path, payload, capture) {
  if (!enviaConfigured(e)) fail2(503, "El cotizador est\xE1 en configuraci\xF3n. Solicita tu env\xEDo por WhatsApp.");
  try {
    const r = await fetch(base(e) + path, { method: "POST", headers: { Authorization: "Bearer " + enviaToken(e.ENVIA_TOKEN), "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15e3) });
    const raw = await r.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { message: raw.slice(0, 1e3) };
    }
    if (capture) await capture({ http_status: r.status, response: parsed });
    if (!r.ok) fail2(502, "Envia.com HTTP " + r.status + ". Verifica el token del ambiente " + e.ENVIA_MODE + ".");
    const data = parsed;
    if (!Array.isArray(data.data) || data.meta === "error") fail2(502, "La respuesta de la paqueter\xEDa no es v\xE1lida.");
    return data.data;
  } catch (e2) {
    if (e2 instanceof APIError) throw e2;
    fail2(503, "La paqueter\xEDa no respondi\xF3. Consulta el estado antes de repetir una compra de gu\xEDa.");
  }
}
function txt(v, max = 150) {
  return typeof v === "string" && v.trim().length <= max ? v.trim() : "";
}
function address2(a) {
  if (!a || typeof a !== "object") fail2(400, "Falta la direcci\xF3n completa.");
  const v = { name: txt(a.name, 100), email: txt(a.email, 180), phone: txt(a.phone, 20).replace(/[\s()-]/g, ""), street: txt(a.street), number: txt(a.number, 20), district: txt(a.district, 100), city: txt(a.city, 80), state: txt(a.state, 3).toUpperCase(), country: "MX", postalCode: txt(a.postalCode, 5), reference: txt(a.reference, 150) };
  if (!v.name || !v.street || !v.number || !v.district || !v.city || !/^\d{5}$/.test(v.postalCode) || !/^\+?\d{10,13}$/.test(v.phone) || !/^[A-Z]{2,3}$/.test(v.state) || !/^\S+@\S+\.\S+$/.test(v.email)) fail2(400, "Revisa direcci\xF3n, n\xFAmero, colonia, tel\xE9fono y c\xF3digo de estado.");
  return v;
}
var destination = (c) => address2({ name: c.name, email: c.email, phone: c.phone, street: c.street, number: c.number, district: c.colony, city: c.city, state: c.state_code, postalCode: c.zip, reference: c.notes });
async function origin(e) {
  const row = await first(e, "SELECT value FROM store_settings WHERE key='origin'");
  if (!row) fail2(409, "Falta configurar la direcci\xF3n de origen del estudio.");
  return address2(JSON.parse(row.value));
}
async function packagesFor(items, e) {
  if (items.reduce((n, i) => n + i.quantity, 0) > 5) fail2(409, "Para m\xE1s de cinco cajas, solicita una cotizaci\xF3n al estudio.");
  const packages = [];
  for (const i of items) {
    const p = await first(e, "SELECT * FROM package_profiles WHERE product_id=? AND variant=?", i.id, i.variant);
    if (!p) fail2(409, "Faltan peso y medidas de " + i.title + ". Solicita una cotizaci\xF3n al estudio.");
    for (let n = 0; n < i.quantity; n++) packages.push({ type: "box", content: i.title, amount: 1, declaredValue: i.price_cents / 100, lengthUnit: "CM", weightUnit: "KG", weight: p.weight, dimensions: { length: p.length, width: p.width, height: p.height } });
  }
  return packages;
}
var quoteFingerprint = (items, customer) => sha(JSON.stringify([items, destination(customer)]));
function normalizeRate(r, carrier) {
  const cents = Math.round(Number(r.totalPrice) * 100);
  if (r.currency !== "MXN" || !Number.isSafeInteger(cents) || cents <= 0 || cents > 1e7 || r.carrier !== carrier || typeof r.service !== "string" || !r.service || ![0, 2].includes(Number(r.dropOff))) return null;
  return { carrier, service: r.service, description: String(r.carrierDescription || carrier) + " \xB7 " + String(r.serviceDescription || r.service), total_cents: cents, estimate: String(r.deliveryEstimate || "Consultar plazo"), dropOff: Number(r.dropOff) };
}
async function enviaRates(items, customer, e) {
  if (!shippingConfigured(e)) fail2(503, "La cotizaci\xF3n por paqueter\xEDa est\xE1 en configuraci\xF3n.");
  const payload = { origin: await origin(e), destination: destination(customer), packages: await packagesFor(items, e), settings: { currency: "MXN", printFormat: "PDF", printSize: "PAPER_4X6" } };
  const carriers = String(e.ENVIA_CARRIERS || "fedex,dhl,estafeta").split(",").map((x) => x.trim()).filter((x) => /^[a-z0-9_-]+$/.test(x)).slice(0, 4);
  if (!carriers.length) fail2(409, "Falta configurar las paqueter\xEDas a consultar.");
  const fingerprint = await quoteFingerprint(items, customer);
  let successes = 0;
  const groups = await Promise.allSettled(carriers.map(async (carrier) => {
    const raw = await envia(e, "/ship/rate/", { ...payload, shipment: { type: 1, carrier } });
    successes++;
    return raw.map((r) => normalizeRate(r, carrier)).filter(Boolean);
  }));
  const offers = groups.flatMap((g) => g.status === "fulfilled" ? g.value : []).sort((a, b) => a.total_cents - b.total_cents).slice(0, 12);
  if (!offers.length) fail2(409, successes ? "No hay servicios disponibles para ese paquete y destino. Consulta al estudio." : "No pudimos obtener tarifas. Revisa tu cuenta o consulta al estudio.");
  await sql(e, "DELETE FROM shipping_quotes WHERE expires_at<? AND NOT EXISTS(SELECT 1 FROM order_shipping WHERE quote_id=shipping_quotes.id)", stamp() - 86400).run();
  const expires = stamp() + 600;
  const list = offers.map((r) => ({ ...r, id: crypto.randomUUID() }));
  await e.DB.batch(list.map((r) => sql(e, "INSERT INTO shipping_quotes(id,fingerprint,payload,carrier,service,description,total_cents,estimate,mode,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)", r.id, fingerprint, JSON.stringify({ ...payload, shipment: { type: 1, carrier: r.carrier, service: r.service } }), r.carrier, r.service, r.description, r.total_cents, r.estimate, e.ENVIA_MODE, expires)));
  return { quotes: list.map((r) => ({ id: r.id, carrier: r.carrier, service: r.service, description: r.description, total: r.total_cents / 100, estimate: r.estimate, drop_off: r.dropOff === 2, expires_at: expires })), mode: e.ENVIA_MODE, partial: groups.some((g) => g.status === "rejected") };
}
async function resolveQuote(id, items, customer, e) {
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id)) fail2(409, "Primero cotiza y selecciona una opci\xF3n de env\xEDo.");
  const row = await first(e, "SELECT * FROM shipping_quotes WHERE id=?", id);
  if (!row || row.expires_at <= stamp() || row.mode !== e.MP_MODE || !shippingProviders(e).includes(JSON.parse(row.payload).provider || "envia") || row.mode !== providerMode(row, e) || row.fingerprint !== await quoteFingerprint(items, customer)) fail2(409, "La cotizaci\xF3n venci\xF3 o cambi\xF3 tu pedido/direcci\xF3n. Vuelve a cotizar.");
  return row;
}
async function purchaseLabel(orderId, expectedCents, e) {
  if (e.LABEL_PURCHASES_ENABLED !== "true") fail2(409, "La compra de gu\xEDas a\xFAn est\xE1 desactivada.");
  const row = await first(e, `SELECT o.*,s.state shipping_state,s.label_data,q.payload,q.mode shipping_mode FROM orders o JOIN order_shipping s ON s.order_id=o.id JOIN shipping_quotes q ON q.id=s.quote_id WHERE o.id=?`, orderId);
  if (!row || row.state !== "approved") fail2(409, "Solo se generan gu\xEDas para pedidos con pago aprobado.");
  if (row.shipping_mode !== providerMode(row, e) || row.mode !== e.MP_MODE) fail2(409, "El modo del pedido no coincide con las cuentas activas.");
  if (row.shipping_state === "ready") return JSON.parse(row.label_data);
  if (JSON.parse(row.payload).provider === "skydropx") return buySkyLabel(row, orderId, expectedCents, e);
  if (row.shipping_state !== "not_started") fail2(409, "Esta gu\xEDa ya se est\xE1 generando o necesita revisi\xF3n en Envia.com. No repitas la compra.");
  const payload = JSON.parse(row.payload), current = await envia(e, "/ship/rate/", payload);
  const matched = current.map((r) => normalizeRate(r, payload.shipment.carrier)).find((r) => r?.service === payload.shipment.service);
  if (!matched) fail2(409, "El servicio elegido ya no est\xE1 disponible. Revisa el pedido.");
  const maximum = Number(e.MAX_LABEL_COST_MXN) > 0 ? Math.round(Number(e.MAX_LABEL_COST_MXN) * 100) : row.shipping_cents;
  if (!Number.isSafeInteger(expectedCents) || expectedCents !== matched.total_cents || expectedCents > row.shipping_cents || !Number.isSafeInteger(maximum) || maximum <= 0 || expectedCents > maximum) fail2(409, "La tarifa cambi\xF3 o supera el importe autorizado. Revisa la cotizaci\xF3n antes de comprar.");
  const attempt = crypto.randomUUID();
  const claim = await sql(e, "UPDATE order_shipping SET state='creating',attempt_id=?,updated_at=? WHERE order_id=? AND state='not_started' AND EXISTS(SELECT 1 FROM orders WHERE id=? AND state='approved')", attempt, stamp(), orderId, orderId).run();
  if (claim.meta.changes !== 1) fail2(409, "La gu\xEDa ya se est\xE1 procesando o cambi\xF3 el estado del pago.");
  try {
    const data = await envia(e, "/ship/generate/", { ...payload, shipment: { ...payload.shipment, orderReference: orderId } }, async (response) => {
      await sql(e, "UPDATE order_shipping SET label_data=? WHERE order_id=? AND attempt_id=?", JSON.stringify({ provider_response: response }), orderId, attempt).run();
    });
    const labels = data.map((l) => {
      let url;
      try {
        url = new URL(l.label);
      } catch {
      }
      if (!url || url.protocol !== "https:" || url.username || url.password || typeof l.trackingNumber !== "string" || !l.trackingNumber || l.currency !== "MXN" || !l.shipmentId) fail2(502, "Gu\xEDa recibida incompleta. Revisa Envia.com.");
      return { shipment_id: String(l.shipmentId), tracking: l.trackingNumber, label_url: url.href, carrier: String(l.carrier), service: String(l.service), total: Number(l.totalPrice) };
    });
    if (!labels.length || labels.some((l) => !Number.isFinite(l.total) || l.total < 0)) fail2(502, "No se confirm\xF3 la gu\xEDa.");
    const result = { labels, cost_warning: Math.round(labels.reduce((n, l) => n + l.total, 0) * 100) > expectedCents };
    await sql(e, "UPDATE order_shipping SET state='ready',label_data=?,amount_cents=?,updated_at=? WHERE order_id=? AND attempt_id=?", JSON.stringify(result), Math.round(labels.reduce((n, l) => n + l.total, 0) * 100), stamp(), orderId, attempt).run();
    return result;
  } catch (e2) {
    await sql(e, "UPDATE order_shipping SET state='needs_review',updated_at=? WHERE order_id=? AND attempt_id=?", stamp(), orderId, attempt).run();
    fail2(503, "No se confirm\xF3 la compra de gu\xEDa. Revisa Envia.com con la referencia " + orderId + " antes de repetir; podr\xEDa haberse cobrado.");
  }
}
async function labelRate(orderId, e) {
  const row = await first(e, `SELECT o.state,o.shipping_cents,s.state shipping_state,s.label_data,q.payload,q.mode FROM orders o JOIN order_shipping s ON s.order_id=o.id JOIN shipping_quotes q ON q.id=s.quote_id WHERE o.id=?`, orderId);
  if (!row || row.state !== "approved") fail2(409, "El pedido no tiene env\xEDo pagado y aprobado.");
  if (row.mode !== providerMode(row, e)) fail2(409, "El modo de la cuenta no coincide con el env\xEDo.");
  if (row.shipping_state === "ready") return { state: "ready", ...JSON.parse(row.label_data) };
  if (JSON.parse(row.payload).provider === "skydropx") return checkSkyLabel(row, orderId, e);
  if (row.shipping_state === "needs_review" && row.label_data) {
    let detail;
    try {
      detail = JSON.parse(row.label_data);
    } catch {
    }
    if (detail?.provider_response?.response?.error?.message === "SERVICE_QUOTE_ONLY") fail2(409, "Envia.com permite cotizar este servicio, pero no generar su PDF. Elige otra paqueteria para una nueva prueba; esta guia no se creo.");
  }
  if (row.shipping_state !== "not_started") fail2(409, "La gu\xEDa requiere revisi\xF3n manual en Envia.com.");
  const p = JSON.parse(row.payload), data = await envia(e, "/ship/rate/", p);
  const r = data.map((x) => normalizeRate(x, p.shipment.carrier)).find((x) => x?.service === p.shipment.service);
  if (!r) fail2(409, "No hay tarifa disponible para ese servicio.");
  return { state: "not_started", description: r.description, total: r.total_cents / 100, total_cents: r.total_cents, paid_shipping: row.shipping_cents / 100, estimate: r.estimate };
}
function providerMode(row, e) {
  return JSON.parse(row.payload).provider === "skydropx" ? e.SKYDROPX_MODE : e.ENVIA_MODE;
}
async function rates(items, customer, e) {
  const providers = shippingProviders(e);
  if (!providers.length) fail2(503, "No hay proveedores de env\xEDo configurados.");
  const tasks = providers.map(async (provider) => {
    if (provider === "envia") {
      const r = await enviaRates(items, customer, e);
      return { ...r, quotes: r.quotes.map((q2) => ({ ...q2, provider, mode: e.ENVIA_MODE, payable: e.ENVIA_MODE === e.MP_MODE })) };
    }
    const offers = await skyOffers(await origin(e), destination(customer), await packagesFor(items, e), e);
    const fingerprint = await quoteFingerprint(items, customer), expires = stamp() + 600;
    const rows = offers.map((r) => ({ ...r, id: crypto.randomUUID() }));
    if (rows.length) await e.DB.batch(rows.map((r) => sql(e, "INSERT INTO shipping_quotes(id,fingerprint,payload,carrier,service,description,total_cents,estimate,mode,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)", r.id, fingerprint, JSON.stringify(r.payload), r.carrier, r.service, r.description, r.total_cents, r.estimate, e.SKYDROPX_MODE, expires)));
    return { quotes: rows.map((r) => ({ id: r.id, provider: "skydropx", mode: e.SKYDROPX_MODE, payable: e.MP_MODE === e.SKYDROPX_MODE, carrier: r.carrier, service: r.service, description: r.description, total: r.total_cents / 100, estimate: r.estimate, drop_off: r.drop_off, expires_at: expires })) };
  });
  const results = await Promise.allSettled(tasks);
  const available = results.flatMap((r) => r.status === "fulfilled" ? r.value.quotes : []).sort((a, b) => Number(b.payable) - Number(a.payable) || a.total - b.total);
  if(!available.length){
  const rejected=results.find(r=>r.status==='rejected'&&r.reason instanceof APIError);
  if(rejected)throw rejected.reason;
  fail2(409,'Skydropx terminó la consulta sin tarifas utilizables. Revisa cobertura, origen y paquetes en Skydropx Sandbox.');
 }
  return { quotes: available, mode: e.MP_MODE, partial: results.some((r) => r.status === "rejected" || r.value?.partial), unavailable_providers: providers.filter((_, i) => results[i].status === "rejected") };
}
async function checkSkyLabel(row, orderId, e) {
  const payload = JSON.parse(row.payload);
  if (row.shipping_state === "needs_review" && row.label_data) {
    const saved = JSON.parse(row.label_data), id = saved.provider_response?.data?.id;
    if (id && /^[-a-zA-Z0-9]+$/.test(id)) {
      const d = await sky(e, "shipments/" + encodeURIComponent(id));
      const parsed = skyLabels(d, payload);
      if (parsed) {
        const result = { provider: "skydropx", labels: parsed.labels, cost_warning: parsed.total_cents > row.shipping_cents };
        await sql(e, "UPDATE order_shipping SET state='ready',label_data=?,amount_cents=?,updated_at=? WHERE order_id=? AND state='needs_review'", JSON.stringify(result), parsed.total_cents, stamp(), orderId).run();
        return { state: "ready", ...result };
      }
    }
    fail2(409, "Skydropx todav\xEDa no confirma la gu\xEDa. Revisa tu cuenta; no vuelvas a comprarla.");
  }
  if (row.shipping_state !== "not_started") fail2(409, "La gu\xEDa requiere revisi\xF3n en Skydropx.");
  const r = await skyRefresh(payload, e);
  return { provider: "skydropx", state: "not_started", description: r.description, total: r.total_cents / 100, total_cents: r.total_cents, paid_shipping: row.shipping_cents / 100, estimate: r.estimate };
}
async function buySkyLabel(row, orderId, expectedCents, e) {
  if (e.SKYDROPX_LABEL_PURCHASES_ENABLED !== "true" || e.MP_MODE !== "live" || row.mode !== "live") fail2(409, "La compra de gu\xEDas de Skydropx est\xE1 desactivada. Primero completa la verificaci\xF3n de producci\xF3n.");
  if (row.shipping_state !== "not_started") fail2(409, "La gu\xEDa ya se procesa o requiere revisi\xF3n en Skydropx. No repitas la compra.");
  const payload = JSON.parse(row.payload), current = await skyRefresh(payload, e);
  const maximum = Number(e.MAX_LABEL_COST_MXN) > 0 ? Math.round(Number(e.MAX_LABEL_COST_MXN) * 100) : row.shipping_cents;
  if (!Number.isSafeInteger(expectedCents) || expectedCents !== current.total_cents || expectedCents > row.shipping_cents || expectedCents > maximum) fail2(409, "La tarifa cambi\xF3 o supera el importe autorizado.");
  const body = skyShipment(payload, JSON.parse(row.items), e), attempt = crypto.randomUUID();
  const claim = await sql(e, "UPDATE order_shipping SET state='creating',attempt_id=?,updated_at=? WHERE order_id=? AND state='not_started' AND EXISTS(SELECT 1 FROM orders WHERE id=? AND state='approved')", attempt, stamp(), orderId, orderId).run();
  if (claim.meta.changes !== 1) fail2(409, "Esta gu\xEDa ya se est\xE1 procesando.");
  try {
    const d = await sky(e, "shipments", body, async (data) => {
      await sql(e, "UPDATE order_shipping SET label_data=? WHERE order_id=? AND attempt_id=?", JSON.stringify({ provider_response: data }), orderId, attempt).run();
    });
    const parsed = skyLabels(d, payload);
    if (!parsed) fail2(503, "Skydropx todav\xEDa est\xE1 preparando la gu\xEDa.");
    const result = { provider: "skydropx", labels: parsed.labels, cost_warning: parsed.total_cents > expectedCents };
    await sql(e, "UPDATE order_shipping SET state='ready',label_data=?,amount_cents=?,updated_at=? WHERE order_id=? AND attempt_id=?", JSON.stringify(result), parsed.total_cents, stamp(), orderId, attempt).run();
    return result;
  } catch (err) {
    await sql(e, "UPDATE order_shipping SET state='needs_review',updated_at=? WHERE order_id=? AND attempt_id=?", stamp(), orderId, attempt).run();
    fail2(503, "La gu\xEDa no est\xE1 confirmada. Consulta su estado en Skydropx antes de repetir; podr\xEDa haberse cobrado.");
  }
}

// cloudflare/src/admin.mjs
var sql2 = (e, s, ...a) => e.DB.prepare(s).bind(...a);
async function authenticate(request, e) {
  if (!e.ADMIN_TOKEN || e.ADMIN_TOKEN.length < 32) throw new APIError(503, "El acceso privado necesita ADMIN_TOKEN de al menos 32 caracteres.");
  const actual = request.headers.get("Authorization") || "";
  const hash = async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  const [a, b] = await Promise.all([hash(actual), hash("Bearer " + e.ADMIN_TOKEN)]);
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  if (d) throw new APIError(401, "La clave del panel no es correcta.");
}
async function admin(path, method, body, e, mp2) {
  if (path === "/api/admin/content") {
    if (method === "GET") return getContent(e);
    if (method === "POST") return saveContent(e, body);
  }
  const CATALOG = (await getContent(e)).products;
  if (path === "/api/admin/skydropx-test" && method === "POST") return skyCheck(e);
  if (path === "/api/admin/payment-diagnostic" && method === "POST") {
    if (!/^4RT-[a-f0-9]{32}$/.test(body?.order_id || "")) throw new APIError(400, "Referencia no v\xE1lida.");
    const order = await sql2(e, "SELECT id,total_cents,shipping_cents,mode FROM orders WHERE id=?", body.order_id).first();
    if (!order) throw new APIError(404, "Pedido no encontrado.");
    const data = await mp2(e, "GET", "/v1/payments/search?" + new URLSearchParams({ external_reference: order.id, sort: "date_created", criteria: "desc", limit: "30" }));
    const account = await mp2(e, "GET", "/users/me");
    return { account_is_test: Array.isArray(account.tags) && account.tags.includes("test_user"), account_matches: String(account.id) === e.MP_COLLECTOR_ID, order, payments: (data.results || []).filter((p) => p.external_reference === order.id).map((p) => ({ id: p.id, status: p.status, transaction_amount: p.transaction_amount, shipping_amount: p.shipping_amount, total_paid_amount: p.transaction_details?.total_paid_amount, currency: p.currency_id, collector_matches: String(p.collector_id) === e.MP_COLLECTOR_ID, live_mode: p.live_mode })) };
  }
  if (path === "/api/admin/status" && method === "GET") {
    const inventory = await sql2(e, "SELECT i.*,p.weight,p.length,p.width,p.height FROM inventory i LEFT JOIN package_profiles p ON p.product_id=i.product_id AND p.variant=i.variant").all();
    const origin2 = await sql2(e, "SELECT value FROM store_settings WHERE key='origin'").first();
    return { mode: e.MP_MODE, payments_enabled: e.PAYMENTS_ENABLED === "true", skydropx_configured: skyConfigured(e), skydropx_mode: e.SKYDROPX_MODE || "pendiente", origin: origin2 ? JSON.parse(origin2.value) : null, inventory: inventory.results.map((i) => {
      const p = CATALOG.find((p2) => p2.id === i.product_id);
      return { ...i, title: (p?.name || i.product_id) + " / " + (p?.variants[i.variant]?.name || i.variant) };
    }) };
  }
  if (path === "/api/admin/orders" && method === "GET") {
    const r = await sql2(e, "SELECT id,state,total_cents,shipping_cents,created_at,mode,items,customer FROM orders ORDER BY created_at DESC LIMIT 50").all();
    return { orders: r.results.map((o) => ({ ...o, items: JSON.parse(o.items), customer: JSON.parse(o.customer) })) };
  }
  if (path === "/api/admin/mercadopago" && method === "POST") {
    const user = await mp2(e, "GET", "/users/me");
    return { valid: true, collector_matches: String(user.id) === e.MP_COLLECTOR_ID, mode: e.MP_MODE, message: "Credencial consultada. Todav\xEDa hace falta completar una compra de prueba y verificar su notificaci\xF3n." };
  }
  if (path === "/api/admin/origin" && method === "POST") {
    const a = address2(body);
    await sql2(e, "INSERT INTO store_settings(key,value) VALUES('origin',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", JSON.stringify(a)).run();
    return { saved: true };
  }
  if (path === "/api/admin/inventory" && method === "POST") {
    const p = CATALOG.find((p2) => p2.id === body?.product_id);
    if (!p?.variants[body?.variant] || !Number.isInteger(body.variant) || !Number.isInteger(body.stock) || body.stock < 0 || body.stock > 1e4 || !Number.isInteger(body.previous_stock)) throw new APIError(400, "Revisa el producto y las unidades disponibles.");
    for (const k of ["weight", "length", "width", "height"]) if (typeof body[k] !== "number" || !Number.isFinite(body[k]) || body[k] <= 0 || body[k] > (k === "weight" ? 100 : 300)) throw new APIError(400, "Indica el peso en kg y las medidas en cm del paquete cerrado.");
    const r = await e.DB.batch([
      sql2(e, "UPDATE inventory SET stock=? WHERE product_id=? AND variant=? AND stock=?", body.stock, body.product_id, body.variant, body.previous_stock),
      sql2(e, "INSERT INTO package_profiles(product_id,variant,weight,length,width,height) SELECT ?,?,?,?,?,? WHERE changes()=1 ON CONFLICT(product_id,variant) DO UPDATE SET weight=excluded.weight,length=excluded.length,width=excluded.width,height=excluded.height", body.product_id, body.variant, body.weight, body.length, body.width, body.height)
    ]);
    if (r[0].meta.changes !== 1) throw new APIError(409, "Las existencias cambiaron. Recarga el panel antes de guardar.");
    return { saved: true };
  }
  throw new APIError(404, "Ruta no encontrada.");
}

// cloudflare/src/worker.mjs
var fail3 = (status, message) => {
  throw new APIError(status, message);
};
var encoder = new TextEncoder();
var hex = (bytes) => [...new Uint8Array(bytes)].map((x) => x.toString(16).padStart(2, "0")).join("");
var now = () => Math.floor(Date.now() / 1e3);
var digest = async (value) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}
function equal(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
var stmt = (env, sql3, ...args) => env.DB.prepare(sql3).bind(...args);
var one = (env, sql3, ...args) => stmt(env, sql3, ...args).first();
function config(env) {
  const rates2 = Object.fromEntries(["local", "centro", "nacional"].map((k) => [k, Number(env["SHIPPING_" + k.toUpperCase()] ?? { local: 50, centro: 150, nacional: 220 }[k])]));
  const validRates = Object.values(rates2).every((n) => Number.isSafeInteger(n) && n >= 0 && n <= 1e5);
  let urls = false;
  try {
    urls = new URL(env.SITE_URL).protocol === "https:" && new URL(env.API_URL).protocol === "https:";
  } catch {
  }
  const shipping = shippingConfigured(env) || env.SHIPPING_RATES_CONFIRMED === "true", pickup = env.PICKUP_CONFIRMED === "true";
  return {
    enabled: !!(env.DB && env.PAYMENTS_ENABLED === "true" && env.MP_ACCESS_TOKEN && env.MP_WEBHOOK_SECRET && env.STATUS_SIGNING_SECRET?.length >= 32 && /^\d+$/.test(env.MP_COLLECTOR_ID || "") && ["test", "live"].includes(env.MP_MODE) && urls && validRates && (shipping || pickup)),
    mode: env.MP_MODE || "test",
    max_installments: Math.max(1, Math.min(12, parseInt(env.MP_MAX_INSTALLMENTS, 10) || 12)),
    shipping_provider: shippingProviders(env).length > 1 ? "both" : shippingProviders(env)[0] || "manual",
    shipping_providers: shippingProviders(env),
    shipping_enabled: shipping,
    pickup_enabled: pickup,
    shipping_rates: rates2
  };
}
function field(obj, key, max, required = true) {
  const value = obj[key] ?? "";
  if (typeof value !== "string" || value.trim().length > max || required && !value.trim()) fail3(400, "Revisa el campo " + key + ".");
  return value.trim();
}
function validate(body, env) {
  if (!body || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 14 || !body.customer || typeof body.customer !== "object") fail3(400, "El carrito o los datos de entrega no son v\xE1lidos.");
  const cfg = config(env), c = {};
  for (const [key, max] of [["name", 100], ["email", 180], ["method", 20]]) c[key] = field(body.customer, key, max);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) fail3(400, "Revisa tu correo electr\xF3nico.");
  c.notes = field(body.customer, "notes", 500, false);
  let shipping = 0;
  if (c.method === "shipping" && cfg.shipping_enabled) {
    for (const [key, max] of [["zip", 5], ["state", 60], ["city", 80], ["colony", 100], ["street", 150]]) c[key] = field(body.customer, key, max);
    if (!/^\d{5}$/.test(c.zip) || Number(c.zip) < 1e3) fail3(400, "Revisa tu c\xF3digo postal.");
    if (shippingConfigured(env)) {
      for (const [key, max] of [["phone", 20], ["number", 20], ["state_code", 3]]) c[key] = field(body.customer, key, max);
    }
    const zip = Number(c.zip), zone = zip >= 2e4 && zip <= 20999 ? "local" : zip >= 1e4 && zip <= 5e4 ? "centro" : "nacional";
    shipping = shippingConfigured(env) ? 0 : cfg.shipping_rates[zone] * 100;
  } else if (!(c.method === "pickup" && cfg.pickup_enabled)) fail3(409, "La modalidad de entrega no est\xE1 habilitada.");
  const seen = /* @__PURE__ */ new Set();
  const items = body.items.map((i) => {
    if (!i || typeof i.id !== "string" || !Number.isInteger(i.variant) || !Number.isInteger(i.quantity)) fail3(400, "Producto o cantidad no v\xE1lidos.");
    const p = (env.catalog || catalog_default).find((p2) => p2.id === i.id), v = p?.variants[i.variant], key = i.id + ":" + i.variant;
    if (!v || i.quantity < 1 || i.quantity > 20 || seen.has(key)) fail3(400, "Revisa las cantidades y los acabados.");
    seen.add(key);
    return { id: i.id, variant: i.variant, quantity: i.quantity, title: p.name + " / " + v.name, price_cents: Math.round((p.price + v.mod) * 100) };
  }).sort((a, b) => a.id.localeCompare(b.id) || a.variant - b.variant);
  return { items, customer: c, shipping, total: items.reduce((s, i) => s + i.quantity * i.price_cents, shipping) };
}
async function mp(env, method, path, payload) {
  try {
    const response = await fetch("https://api.mercadopago.com" + path, { method, headers: { Authorization: "Bearer " + env.MP_ACCESS_TOKEN, "Content-Type": "application/json" }, body: payload ? JSON.stringify(payload) : void 0, signal: AbortSignal.timeout(18e3) });
    if (!response.ok) fail3(502, "Mercado Pago no pudo completar la operaci\xF3n.");
    return await response.json();
  } catch (e) {
    if (e instanceof APIError) throw e;
    fail3(503, "Mercado Pago no respondi\xF3. Consulta al estudio antes de repetir el pedido.");
  }
}
async function checkoutResult(row, env) {
  return { order_id: row.id, status_token: await hmac(env.STATUS_SIGNING_SECRET, row.id), checkout_url: row.checkout_url, total: row.total_cents / 100 };
}
async function existing(row, fingerprint, env) {
  if (row.fingerprint !== fingerprint) fail3(409, "Esta referencia pertenece a otra selecci\xF3n.");
  if (row.checkout_url && ["awaiting_payment", "pending", "in_process"].includes(row.state) && now() - row.created_at < 1800) return checkoutResult(row, env);
  fail3(409, "El intento ya est\xE1 registrado. Consulta al estudio con referencia " + row.id + ".");
}
async function checkout(body, key, env) {
  if (!config(env).enabled) fail3(503, "El pago en l\xEDnea est\xE1 en activaci\xF3n.");
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(key || "")) fail3(400, "Falta una referencia v\xE1lida del intento.");
  let { items, customer, shipping, total } = validate(body, env);
  const dynamic = customer.method === "shipping" && shippingConfigured(env);
  const fingerprint = await digest(JSON.stringify([items, customer, dynamic ? body.shipping_quote_id : shipping]));
  const old = await one(env, "SELECT * FROM orders WHERE request_key=?", key);
  if (old) return existing(old, fingerprint, env);
  const quote = dynamic ? await resolveQuote(body.shipping_quote_id, items, customer, env) : null;
  if (quote) {
    shipping = quote.total_cents;
    total += shipping;
  }
  const id = "4RT-" + crypto.randomUUID().replaceAll("-", "");
  try {
    await env.DB.batch([
      stmt(env, "INSERT INTO orders(id,request_key,fingerprint,items,customer,total_cents,shipping_cents,state,created_at,mode) VALUES(?,?,?,?,?,?,?,?,?,?)", id, key, fingerprint, JSON.stringify(items), JSON.stringify(customer), total, shipping, "creating", now(), env.MP_MODE),
      ...items.map((i) => stmt(env, "INSERT INTO order_items(order_id,product_id,variant,quantity) VALUES(?,?,?,?)", id, i.id, i.variant, i.quantity)),
      ...quote ? [stmt(env, "INSERT INTO order_shipping(order_id,quote_id) VALUES(?,?)", id, quote.id)] : []
    ]);
  } catch (e) {
    const concurrent = await one(env, "SELECT * FROM orders WHERE request_key=?", key);
    if (concurrent) return existing(concurrent, fingerprint, env);
    if (String(e.message).includes("insufficient_stock")) fail3(409, "No hay suficientes unidades. Consulta disponibilidad con el estudio.");
    throw e;
  }
  const token2 = await hmac(env.STATUS_SIGNING_SECRET, id), callback = env.SITE_URL.replace(/\/$/, "") + "/pago.html?" + new URLSearchParams({ order: id, token: token2 });
  try {
    const response = await mp(env, "POST", "/checkout/preferences", {
      items: items.map((i) => ({ id: i.id, title: i.title, quantity: i.quantity, unit_price: i.price_cents / 100, currency_id: "MXN" })),
      ...env.MP_MODE === "live" ? { payer: { email: customer.email, name: customer.name } } : {},
      external_reference: id,
      back_urls: { success: callback, pending: callback, failure: callback },
      auto_return: "approved",
      notification_url: env.API_URL.replace(/\/$/, "") + "/api/webhooks/mercadopago",
      payment_methods: { installments: config(env).max_installments },
      expires: true,
      expiration_date_to: new Date(Date.now() + 18e5).toISOString(),
      shipments: { cost: shipping / 100, mode: "not_specified" },
      statement_descriptor: "4RTB4N STUDIO"
    });
    const target = env.MP_MODE === "test" ? response.sandbox_init_point : response.init_point;
    let valid = false;
    try {
      const u = new URL(target);
      valid = u.protocol === "https:" && ["www.mercadopago.com.mx", "sandbox.mercadopago.com.mx"].includes(u.hostname) && !u.username && !u.password;
    } catch {
    }
    if (!valid || !response.id) fail3(502, "No se recibi\xF3 un enlace v\xE1lido.");
    await stmt(env, "UPDATE orders SET preference_id=?,checkout_url=?,state=CASE WHEN state='creating' THEN 'awaiting_payment' ELSE state END WHERE id=?", String(response.id), target, id).run();
    return checkoutResult(await one(env, "SELECT * FROM orders WHERE id=?", id), env);
  } catch {
    await stmt(env, "UPDATE orders SET state='needs_review' WHERE id=? AND state='creating'", id).run();
    fail3(503, "No se pudo confirmar el enlace. No repitas el pedido; consulta al estudio con referencia " + id + ".");
  }
}
async function signatureValid(signature, requestId, dataId, env) {
  try {
    const parts = Object.fromEntries(signature.split(",").map((s) => s.trim().split("="))), ts = Number(parts.ts), seconds = ts > 1e12 ? ts / 1e3 : ts;
    if (!env.MP_WEBHOOK_SECRET || !requestId || !dataId || !Number.isFinite(seconds) || Math.abs(Date.now() / 1e3 - seconds) > 600) return false;
    return equal(await hmac(env.MP_WEBHOOK_SECRET, `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`), parts.v1);
  } catch {
    return false;
  }
}
async function applyPayment(p, env) {
  if (typeof p.external_reference !== "string") return;
  const row = await one(env, "SELECT * FROM orders WHERE id=?", p.external_reference);
  if (!row) return;
  const shippingCents = Number(p.shipping_amount ?? 0) * 100;
  const cents = Number(p.transaction_amount) * 100 + shippingCents;
  if (p.currency_id !== "MXN" || !Number.isFinite(cents) || Math.abs(cents - row.total_cents) > 1e-6 || String(p.collector_id) !== env.MP_COLLECTOR_ID || !Number.isFinite(shippingCents) || Math.abs(shippingCents - row.shipping_cents) > 1e-6 || typeof p.live_mode !== "boolean") fail3(409, "El pago no coincide con el pedido.");
  if (p.live_mode === true) {
    const seller = await mp(env, "GET", "/users/me");
    const isTest = Array.isArray(seller.tags) && seller.tags.includes("test_user");
    if (String(seller.id) !== env.MP_COLLECTOR_ID || isTest !== (row.mode === "test")) fail3(409, "El ambiente de la cuenta no coincide con el pedido.");
  } else if (row.mode !== "test") fail3(409, "Un pago de prueba no puede aprobar una venta real.");
  const id = String(p.id), statuses = ["approved", "pending", "in_process", "rejected", "cancelled", "refunded", "charged_back"], updated = Date.parse(p.date_last_updated);
  if (!/^\d+$/.test(id) || !statuses.includes(p.status) || !Number.isFinite(updated)) fail3(502, "Respuesta de pago no v\xE1lida.");
  await env.DB.batch([
    stmt(env, `INSERT INTO payments(id,order_id,status,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at WHERE payments.order_id=excluded.order_id AND payments.updated_at<excluded.updated_at`, id, row.id, p.status, updated),
    stmt(env, `UPDATE orders SET state=COALESCE((SELECT status FROM payments WHERE order_id=? ORDER BY CASE status WHEN 'approved' THEN 1 WHEN 'charged_back' THEN 2 WHEN 'refunded' THEN 3 WHEN 'in_process' THEN 4 WHEN 'pending' THEN 5 WHEN 'rejected' THEN 6 ELSE 7 END LIMIT 1),state) WHERE id=?`, row.id, row.id)
  ]);
}
async function orderStatus(id, token2, env) {
  if (!env.STATUS_SIGNING_SECRET || !equal(await hmac(env.STATUS_SIGNING_SECRET, id), token2)) fail3(404, "No se encontr\xF3 ese pedido.");
  let row = await one(env, "SELECT * FROM orders WHERE id=?", id);
  if (!row) fail3(404, "No se encontr\xF3 ese pedido.");
  if (env.MP_ACCESS_TOKEN) {
    const claim = await stmt(env, "UPDATE orders SET checked_at=? WHERE id=? AND checked_at<=?", now(), id, now() - 15).run();
    if (claim.meta.changes) {
      const result = await mp(env, "GET", "/v1/payments/search?" + new URLSearchParams({ external_reference: id, sort: "date_created", criteria: "desc", limit: "30" }));
      for (const p of result.results || []) if (p.external_reference === id) await applyPayment(p, env);
    }
  }
  row = await one(env, "SELECT * FROM orders WHERE id=?", id);
  return { order_id: id, status: row.state, total: row.total_cents / 100, mode: row.mode };
}
async function readBody(request, max = 16e3) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) fail3(400, "Se requiere JSON.");
  if (Number(request.headers.get("content-length")) > max) fail3(413, "Solicitud demasiado grande.");
  const reader = request.body?.getReader();
  if (!reader) fail3(400, "Solicitud vac\xEDa.");
  let length = 0, chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) {
      await reader.cancel();
      fail3(413, "Solicitud demasiado grande.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    fail3(400, "JSON no v\xE1lido.");
  }
}
var limits = /* @__PURE__ */ new Map();
function limit(request, path) {
  const ip = request.headers.get("CF-Connecting-IP") || "local", key = ip + ":" + (path.includes("/orders/") ? "orders" : path), minute = Math.floor(Date.now() / 6e4);
  if (limits.size > 5e3) limits.clear();
  let item = limits.get(key);
  if (!item || item.minute !== minute) item = { minute, hits: 0 };
  item.hits++;
  limits.set(key, item);
  if (item.hits > (["/api/checkout", "/api/shipping/quotes"].includes(path) ? 15 : 120)) fail3(429, "Demasiadas solicitudes. Intenta en un minuto.");
}
var worker_default = {
  async fetch(request, env) {
    env = { ...env, SHIPPING_PROVIDER: "skydropx", ENVIA_TOKEN: void 0 };
    const u = new URL(request.url), path = u.pathname, origin2 = request.headers.get("Origin") || "";
    let siteOrigin = "";
    try {
      siteOrigin = new URL(env.SITE_URL).origin;
    } catch {
    }
    const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Vary": "Origin" };
    if (origin2 && origin2 === siteOrigin) Object.assign(headers, { "Access-Control-Allow-Origin": origin2, "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key, Authorization", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" });
    try {
      let result;
      if (request.method === "OPTIONS") {
        if (!siteOrigin || origin2 !== siteOrigin) fail3(403, "Origen no permitido.");
        return new Response(null, { status: 204, headers });
      }
      if (path === "/api/content" && request.method === "GET") {
        const c = await getContent(env);
        result = { products: pricedProducts(c), collections: c.collections.filter((x) => x.active), promotions: activePromotions(c) };
      } else if (path === "/api/config" && request.method === "GET") result = config(env);
      else if (path === "/api/health" && request.method === "GET") {
        if (!env.DB) fail3(503, "Base de datos pendiente.");
        await one(env, "SELECT id FROM orders LIMIT 1");
        result = { ok: true, payments_enabled: config(env).enabled };
      } else if (path.startsWith("/api/")) {
        limit(request, path);
        if (["/api/checkout", "/api/shipping/quotes", "/api/admin/test-checkout"].includes(path)) env = { ...env, catalog: pricedProducts(await getContent(env)).filter((p) => p.type === "fixed") };
        if (path.startsWith("/api/admin/")) {
          if (!siteOrigin || origin2 !== siteOrigin) fail3(403, "Origen no permitido.");
          await authenticate(request, env);
          const body = request.method === "POST" ? await readBody(request, path === "/api/admin/content" ? 2e6 : 16e3) : null;
          const match = path.match(/^\/api\/admin\/orders\/(4RT-[a-f0-9]{32})\/(rate|label|payment)$/);
          if (match && request.method === "POST") {
            const payment = await orderStatus(match[1], await hmac(env.STATUS_SIGNING_SECRET, match[1]), env);
            result = match[2] === "payment" ? payment : match[2] === "rate" ? await labelRate(match[1], env) : await purchaseLabel(match[1], body.expected_cents, env);
          } else if (path === "/api/admin/test-checkout" && request.method === "POST") {
            if (env.MP_MODE !== "test") fail3(409, "Disponible solo en modo de prueba.");
            result = await checkout(body, request.headers.get("Idempotency-Key"), { ...env, PAYMENTS_ENABLED: "true", PICKUP_CONFIRMED: "true" });
          } else result = await admin(path, request.method, body, env, mp);
        } else if (path === "/api/shipping/quotes" && request.method === "POST") {
          if (!siteOrigin || origin2 !== siteOrigin) fail3(403, "Origen no permitido.");
          const v = validate(await readBody(request), env);
          if (v.customer.method !== "shipping") fail3(400, "Selecciona env?o a domicilio.");
          for (const i of v.items) {
            const stock = await one(env, "SELECT stock FROM inventory WHERE product_id=? AND variant=?", i.id, i.variant);
            if (!stock || stock.stock < i.quantity) fail3(409, "No hay suficientes unidades de " + i.title + ".");
          }
          result = await rates(v.items, v.customer, env);
        } else if (path === "/api/checkout" && request.method === "POST") {
          if (!siteOrigin || origin2 !== siteOrigin) fail3(403, "Origen no permitido.");
          result = await checkout(await readBody(request), request.headers.get("Idempotency-Key"), env);
        } else if (path === "/api/webhooks/mercadopago" && request.method === "POST") {
          const id = u.searchParams.get("data.id") || "";
          if (!await signatureValid(request.headers.get("x-signature") || "", request.headers.get("x-request-id"), id, env)) fail3(401, "Firma no v\xE1lida.");
          const body = await readBody(request);
          if (body?.type === "payment" && /^\d+$/.test(id)) {
            if (String(body.data?.id) !== id) fail3(400, "Referencia no v\xE1lida.");
            const p = await mp(env, "GET", "/v1/payments/" + id);
            if (String(p.id) !== id) fail3(400, "Referencia no v\xE1lida.");
            await applyPayment(p, env);
          }
          result = { received: true };
        } else if (/^\/api\/orders\/4RT-[a-f0-9]{32}$/.test(path) && request.method === "GET") result = await orderStatus(path.split("/").pop(), u.searchParams.get("token") || "", env);
        else fail3(404, "Ruta no encontrada.");
      } else fail3(404, "Ruta no encontrada.");
      return new Response(JSON.stringify(result), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e instanceof APIError ? e.message : "No se pudo completar la operaci\xF3n. Contacta al estudio." }), { status: e instanceof APIError ? e.status : 500, headers });
    }
  }
};
export {
  APIError,
  applyPayment,
  checkout,
  config,
  worker_default as default,
  digest,
  hmac,
  orderStatus,
  signatureValid,
  validate
};
