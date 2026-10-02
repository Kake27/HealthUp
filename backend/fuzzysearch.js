

function collect(node, prefix, out, limit) {
  if (out.length >= limit) return;
  if (node.isWord) out.push(prefix);
  for (const [ch, child] of Object.entries(node.children)) {
    if (out.length >= limit) break;
    collect(child, prefix + ch, out, limit);
  }
}

function getPrefixMatches(trie, prefix, limit = 10) {
  
  let node = trie.root;
  for (const ch of prefix){
    if (!node.children[ch]) return []; // no such prefix
    node = node.children[ch];
  }
  const out = [];
  if (node.isWord) out.push(prefix);
  for (const [ch, child] of Object.entries(node.children)) {
    if (out.length >= limit) break;
    collect(child, prefix + ch, out, limit);
  }
  return out.slice(0, limit);
}

function fuzzySearch(trie, rawWord, maxEdits = 4, limit = 10) {
  if (!rawWord || typeof rawWord !== "string") return [];
  const word = rawWord.toLowerCase().trim().replace(/[^a-z0-9 ]+/g, "");

  
  if (!word) return [];

  
  if (word.length <= 2) {
    return getPrefixMatches(trie, word, limit);
  }

  
  const prefixMatches = getPrefixMatches(trie, word, limit);
  if (prefixMatches.length >= limit) {
    return prefixMatches.slice(0, limit);
  }

  
  const results = []; 
  const m = word.length;
  const prevRow = Array.from({ length: m + 1 }, (_, i) => i);

  function recurse(node, char, prevRow, prefix) {
    const n = prevRow.length;
    const curRow = [prevRow[0] + 1];

    for (let i = 1; i < n; i++) {
      const insertCost = curRow[i - 1] + 1;
      const deleteCost = prevRow[i] + 1;
      const replaceCost = prevRow[i - 1] + (word[i - 1] === char ? 0 : 1);
      curRow.push(Math.min(insertCost, deleteCost, replaceCost));
    }

    const dist = curRow[n - 1];

    if (node.isWord && dist <= maxEdits) {
      results.push({ word: prefix, dist });
      if (results.length >= limit) return;
    }

    if (Math.min(...curRow) <= maxEdits) {
      for (const [nextCh, child] of Object.entries(node.children)) {
        if (results.length >= limit) break;
        recurse(child, nextCh, curRow, prefix + nextCh);
      }
    }
  }

  for (const [ch, child] of Object.entries(trie.root.children)) {
    recurse(child, ch, prevRow, ch);
    if (results.length >= limit) break;
  }

  
  const uniq = new Map();
  for (const p of prefixMatches){
    uniq.set(p, { word: p, pref: 1, dist: 0 });
  }
  for (const r of results) {
    if (!uniq.has(r.word)) uniq.set(r.word, { word: r.word, pref: 0, dist: r.dist });
  }

  const finalArr = Array.from(uniq.values())
    .sort((a, b) => {
    
      if (b.pref - a.pref !== 0) return b.pref - a.pref;
      if (a.dist - b.dist !== 0) return a.dist - b.dist;
      return a.word.localeCompare(b.word);
    })
    .slice(0, limit)
    .map(x => x.word);

  return finalArr;
}

module.exports = fuzzySearch;
