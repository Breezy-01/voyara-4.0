(() => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'');
  const matches = (card,s,today) => {
    const event = card.category === 'events';
    if (event !== (s.mode === 'events')) return false;
    if (event && (!card.date || card.date < today || (s.date && card.date !== s.date))) return false;
    if (s.island !== 'all' && card.island !== s.island) return false;
    const terms = normalize(s.query).split(/[\s,]+/).filter(Boolean);
    if (!terms.every(term => normalize(card.text).includes(term))) return false;
    if (s.categories.length && !s.categories.includes(card.category)) return false;
    if (s.events.length && !s.events.some(type => card.events.includes(type))) return false;
    if (card.price > s.price || card.rating < s.rating) return false;
    if (s.audience !== 'any' && card.audience !== s.audience) return false;
    if (s.durations.length && !s.durations.some(n => n === 2 ? card.duration <= 2 : n === 4 ? card.duration > 2 && card.duration <= 4 : n === 8 ? card.duration > 4 && card.duration < 8 : card.duration >= 8)) return false;
    return (!s.times.length || s.times.some(time => card.times.includes(time))) && s.features.every(feature => card.features.includes(feature));
  };
  window.VoyaraSearchLogic = {matches};
})();
