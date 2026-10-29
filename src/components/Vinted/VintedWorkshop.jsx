import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  VINTED_KEY,
  ETATS,
  STATUSES,
  statusOf,
  fromApi,
  descriptionText,
} from '../../data/vinted';
import { VintedStatusIcon } from '../Icons';
import './VintedWorkshop.css';

const MAX_PHOTOS = 6;
const MAX_SIDE = 1024;

// Les photos partent en base64 dans le corps de la requête : on les redimensionne
// avant l'envoi pour rester loin de la limite de taille de la fonction serverless.
async function compressPhoto(file) {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return { data: dataUrl.split(',')[1], mediaType: 'image/jpeg', preview: dataUrl };
  } finally {
    bitmap.close();
  }
}

export default function VintedWorkshop() {
  const [listings, setListings] = useLocalStorage(VINTED_KEY, []);
  const [photos, setPhotos] = useState([]);
  const [hints, setHints] = useState({ marque: '', taille: '', prix: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState('');
  const [filter, setFilter] = useState('all');

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    setError('');
    try {
      const room = MAX_PHOTOS - photos.length;
      const compressed = await Promise.all(files.slice(0, room).map(compressPhoto));
      setPhotos((prev) => [...prev, ...compressed]);
    } catch {
      setError("Une photo n'a pas pu être lue");
    }
  };

  const removePhoto = (index) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const generate = async () => {
    if (!photos.length) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: photos.map(({ data, mediaType }) => ({ data, mediaType })),
          hints,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Génération impossible');

      const listing = fromApi(payload);
      setListings((prev) => [listing, ...prev]);
      setOpenId(listing.id);
      setPhotos([]);
      setHints({ marque: '', taille: '', prix: '', notes: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (id, patch) =>
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const remove = (id) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (openId === id) setOpenId(null);
  };

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('Copie refusée par le navigateur');
    }
  };

  const visible =
    filter === 'all' ? listings : listings.filter((l) => l.status === filter);
  const toPublish = listings.filter((l) => l.status !== 'published').length;

  return (
    <div className="vinted">
      <div className="vinted-header">
        <h2 className="vinted-title">Atelier Vinted</h2>
        <span className="vinted-count">
          {toPublish === 0 ? 'Rien en attente' : `${toPublish} à publier`}
        </span>
      </div>

      <section className="vinted-composer">
        <label className="vinted-drop">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={addPhotos}
            disabled={photos.length >= MAX_PHOTOS || loading}
          />
          <Camera size={22} className="vinted-drop-icon" aria-hidden="true" />
          <span className="vinted-drop-label">
            {photos.length >= MAX_PHOTOS
              ? `${MAX_PHOTOS} photos — maximum atteint`
              : 'Ajouter des photos de la pièce'}
          </span>
          <span className="vinted-drop-hint">
            Étiquette de taille et de composition incluses si possible
          </span>
        </label>

        {photos.length > 0 && (
          <ul className="vinted-thumbs">
            {photos.map((photo, i) => (
              <li key={i} className="vinted-thumb">
                <img src={photo.preview} alt={`Photo ${i + 1}`} />
                <button
                  className="vinted-thumb-remove"
                  onClick={() => removePhoto(i)}
                  aria-label={`Retirer la photo ${i + 1}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="vinted-hints">
          <input
            type="text"
            placeholder="Marque (optionnel)"
            value={hints.marque}
            onChange={(e) => setHints((h) => ({ ...h, marque: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Taille"
            value={hints.taille}
            onChange={(e) => setHints((h) => ({ ...h, taille: e.target.value }))}
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Prix voulu €"
            value={hints.prix}
            onChange={(e) => setHints((h) => ({ ...h, prix: e.target.value }))}
          />
        </div>
        <input
          type="text"
          className="vinted-notes"
          placeholder="Précisions : défaut connu, porté 2 fois, acheté en 2023…"
          value={hints.notes}
          onChange={(e) => setHints((h) => ({ ...h, notes: e.target.value }))}
        />

        <button
          className="btn-primary vinted-generate"
          onClick={generate}
          disabled={!photos.length || loading}
        >
          {loading ? 'Analyse des photos…' : "Rédiger l'annonce"}
        </button>

        {error && <p className="vinted-error">{error}</p>}
        <p className="vinted-privacy">
          Les photos servent à l&apos;analyse puis sont oubliées : seul le texte
          généré est enregistré. Tu les ajoutes toi-même dans Vinted au moment de
          publier.
        </p>
      </section>

      <div className="vinted-filters">
        <button
          className={`vinted-filter-btn${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tout
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.id}
            className={`vinted-filter-btn${filter === s.id ? ' active' : ''}`}
            onClick={() => setFilter(s.id)}
          >
            <VintedStatusIcon id={s.id} size={14} />
            {s.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="vinted-empty">
          {listings.length === 0
            ? 'Aucune annonce préparée. Photographie une pièce pour commencer.'
            : 'Rien dans cette catégorie.'}
        </p>
      ) : (
        <ul className="vinted-items">
          {visible.map((listing) => (
            <li
              key={listing.id}
              className={`vinted-item${listing.status === 'published' ? ' published' : ''}`}
            >
              <div className="vinted-item-head">
                <button
                  className="vinted-item-summary"
                  onClick={() => setOpenId(openId === listing.id ? null : listing.id)}
                >
                  <span className="vinted-item-titre">
                    {listing.titre || 'Annonce sans titre'}
                  </span>
                  <span className="vinted-item-meta">
                    <VintedStatusIcon id={listing.status} size={13} className="vinted-meta-icon" />
                    {statusOf(listing.status).label}
                    {listing.prix && ` · ${listing.prix} €`}
                  </span>
                </button>
                <button
                  className="vinted-delete"
                  onClick={() => remove(listing.id)}
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>

              {openId === listing.id && (
                <div className="vinted-item-body">
                  <div className="vinted-copy-row">
                    <button
                      className="btn-secondary"
                      onClick={() => copy(`${listing.id}-t`, listing.titre)}
                    >
                      {copied === `${listing.id}-t` ? '✓ Copié' : 'Copier le titre'}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => copy(`${listing.id}-d`, descriptionText(listing))}
                    >
                      {copied === `${listing.id}-d`
                        ? '✓ Copié'
                        : 'Copier la description'}
                    </button>
                  </div>

                  <label className="vinted-field">
                    <span>Titre ({listing.titre.length}/60)</span>
                    <input
                      type="text"
                      maxLength={60}
                      value={listing.titre}
                      onChange={(e) => update(listing.id, { titre: e.target.value })}
                    />
                  </label>

                  <label className="vinted-field">
                    <span>Description</span>
                    <textarea
                      rows={6}
                      value={listing.description}
                      onChange={(e) =>
                        update(listing.id, { description: e.target.value })
                      }
                    />
                  </label>

                  <div className="vinted-grid">
                    <label className="vinted-field">
                      <span>Marque</span>
                      <input
                        type="text"
                        value={listing.marque}
                        onChange={(e) => update(listing.id, { marque: e.target.value })}
                      />
                    </label>
                    <label className="vinted-field">
                      <span>Taille</span>
                      <input
                        type="text"
                        value={listing.taille}
                        onChange={(e) => update(listing.id, { taille: e.target.value })}
                      />
                    </label>
                    <label className="vinted-field">
                      <span>État</span>
                      <select
                        value={listing.etat}
                        onChange={(e) => update(listing.id, { etat: e.target.value })}
                      >
                        {ETATS.map((etat) => (
                          <option key={etat} value={etat}>
                            {etat}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="vinted-field">
                      <span>Prix €</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={listing.prix}
                        onChange={(e) => update(listing.id, { prix: e.target.value })}
                      />
                    </label>
                  </div>

                  <p className="vinted-aside">
                    <strong>Catégorie</strong> {listing.categorie || '—'}
                  </p>
                  {listing.prixMin && (
                    <p className="vinted-aside">
                      <strong>Plancher conseillé</strong> {listing.prixMin} € en
                      négociation
                    </p>
                  )}
                  {listing.defauts.length > 0 && (
                    <p className="vinted-aside warn">
                      <strong>Défauts à mentionner</strong>{' '}
                      {listing.defauts.join(', ')}
                    </p>
                  )}
                  {listing.conseilPhotos && (
                    <p className="vinted-aside">
                      <strong>Photo manquante</strong> {listing.conseilPhotos}
                    </p>
                  )}

                  <div className="vinted-status-picker">
                    {STATUSES.map((s) => (
                      <button
                        key={s.id}
                        className={`vinted-status-btn${listing.status === s.id ? ' active' : ''}`}
                        onClick={() => update(listing.id, { status: s.id })}
                      >
                        <VintedStatusIcon id={s.id} size={14} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
