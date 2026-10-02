// class TrieNode {
//   constructor() {
//     this.children = {};
//     this.isWord = false;
//   }
// }

// class Trie {
//   constructor() {
//     this.root = new TrieNode();
//   }



//   insert(word) {

//   if (typeof word !== 'string') {
//         console.error("Invalid word:", word);
//         return;
//     }

//     let node = this.root;
//     for (let ch of word.toLowerCase()) {
//       node.children[ch] = node.children[ch] || new TrieNode();
//       node = node.children[ch];
//     }
//     node.isWord = true;
//   }
// }

// module.exports = Trie;


class TrieNode {
  constructor() {
    this.children = {};
    this.isWord = false;
    this.price = null; // 💰 store price at the end node
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, price) {
    if (typeof word !== "string") {
      console.error("Invalid word:", word);
      return;
    }

    let node = this.root;
    for (let ch of word.toLowerCase()) {
      node.children[ch] = node.children[ch] || new TrieNode();
      node = node.children[ch];
    }
    node.isWord = true;
    node.price = price || 50; // default fallback
  }

  find(word) {
    let node = this.root;
    for (let ch of word.toLowerCase()) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node.isWord ? node.price : null;
  }
}

module.exports = Trie;
