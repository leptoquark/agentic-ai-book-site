(() => {
  const scenes = {
    orchestrazione: {
      kicker: "Pattern 01 / Routing",
      title: "Una richiesta. Percorsi diversi.",
      label: "Diagramma interattivo dell'orchestrazione",
      nodes: [
        ["Richiesta", "Che lavoro serve?", "L'input entra nel sistema. Prima di chiedere al modello una risposta, occorre capire che tipo di lavoro richiede."],
        ["Router", "Una scelta esplicita", "Il routing indirizza la richiesta verso il percorso appropriato. La scelta deve poter essere osservata e verificata."],
        ["Percorso|specializzato", "Ogni compito ha un flusso", "Ricerca nelle fonti, chiamata a uno strumento o risposta diretta: percorsi diversi hanno controlli e costi diversi."],
        ["Valutazione", "Controllare l'esito", "Un controllo può verificare qualità, formato e coerenza con i vincoli prima di consegnare il risultato."],
        ["Risposta", "Un risultato tracciabile", "La risposta finale dovrebbe rendere visibile quale percorso è stato seguito e su quali evidenze si fonda."]
      ]
    },
    rag: {
      kicker: "Pattern 02 / RAG",
      title: "La risposta ha una fonte.",
      label: "Diagramma interattivo di RAG ed evidenze",
      nodes: [
        ["Domanda", "Partire dal bisogno", "La domanda definisce ciò che va cercato. Una formulazione ambigua può portare a recuperare fonti poco pertinenti."],
        ["Recupero", "Cercare nei documenti", "Il sistema seleziona frammenti da una base di conoscenza. Conta anche quale versione dei documenti viene consultata."],
        ["Evidenze", "Distinguere fonte e ipotesi", "I passaggi recuperati devono restare identificabili, così da poter distinguere ciò che la fonte dice da ciò che il modello inferisce."],
        ["Sintesi", "Generare con vincoli", "Il modello costruisce una risposta usando le evidenze disponibili e rispettando le istruzioni di formato e qualità."],
        ["Verifica", "Tornare alla fonte", "Chi legge deve poter risalire alle fonti e riconoscere quando le evidenze non bastano per una risposta affidabile."]
      ]
    },
    governance: {
      kicker: "Pattern 03 / Controllo",
      title: "Un agente utile resta governabile.",
      label: "Diagramma interattivo di controlli e audit",
      nodes: [
        ["Intento", "Capire l'azione", "Una richiesta di consultazione e una di scrittura hanno impatti diversi. Il sistema deve riconoscere la differenza."],
        ["Policy", "Verificare i confini", "Identità, autorizzazioni, minimo privilegio e guardrail definiscono ciò che il sistema può fare."],
        ["Strumento", "Eseguire con controllo", "Una chiamata a un servizio esterno richiede argomenti validati, gestione degli errori e attenzione agli effetti collaterali."],
        ["Persona", "Fermarsi quando serve", "Per azioni sensibili, l'approvazione umana deve essere informata: contesto, prove e conseguenze visibili."],
        ["Audit", "Ricostruire dopo", "Log, versioni delle fonti, decisioni e risultati consentono di spiegare ciò che è accaduto anche mesi dopo."]
      ]
    }
  };
  const svg = document.getElementById("concept-diagram");
  if (!svg) return;
  const tabs = [...document.querySelectorAll(".lab-tab")];
  const title = document.getElementById("scene-title");
  const kicker = document.getElementById("scene-kicker");
  const panel = document.getElementById("lab-panel");
  const detailIndex = document.getElementById("detail-index");
  const detailTitle = document.getElementById("detail-title");
  const detailCopy = document.getElementById("detail-copy");
  let sceneName = "orchestrazione";
  let selected = 0;
  const ns = "http://www.w3.org/2000/svg";
  const make = (tag, attrs = {}) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    return el;
  };
  const points = [[95,175],[278,130],[460,175],[642,130],[825,175]];
  function selectNode(index, focus = false) {
    selected = index;
    const data = scenes[sceneName].nodes[index];
    detailIndex.textContent = `${String(index + 1).padStart(2, "0")} / 05`;
    detailTitle.textContent = data[1];
    detailCopy.textContent = data[2];
    svg.querySelectorAll(".diagram-node").forEach((el, i) => {
      el.classList.toggle("active", i === index);
      el.setAttribute("aria-pressed", String(i === index));
      if (focus && i === index) el.focus();
    });
    svg.querySelectorAll(".diagram-connection").forEach((el, i) => el.classList.toggle("active", i < index));
  }
  function render(name) {
    sceneName = name;
    selected = 0;
    const scene = scenes[name];
    title.textContent = scene.title;
    kicker.textContent = scene.kicker;
    svg.setAttribute("aria-label", scene.label);
    const activeTab = tabs.find(tab => tab.dataset.scene === name);
    panel.setAttribute("aria-labelledby", activeTab.id);
    tabs.forEach(tab => {
      const active = tab === activeTab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    svg.replaceChildren();
    const defs = make("defs");
    const marker = make("marker", {id:"diagram-arrow",viewBox:"0 0 10 10",refX:"7",refY:"5",markerWidth:"6",markerHeight:"6",orient:"auto-start-reverse"});
    marker.append(make("path", {d:"M 0 0 L 10 5 L 0 10 z",fill:"#8c97a8"}));
    defs.append(marker);
    svg.append(defs);
    points.slice(0, -1).forEach(([x,y], i) => {
      const [nx,ny] = points[i + 1];
      svg.append(make("path", {
        d:`M ${x + 53} ${y} C ${x + 105} ${y}, ${nx - 105} ${ny}, ${nx - 55} ${ny}`,
        class:"diagram-connection",
        "marker-end":"url(#diagram-arrow)"
      }));
    });
    scene.nodes.forEach((node, i) => {
      const [x,y] = points[i];
      const group = make("g", {
        class:"diagram-node",transform:`translate(${x} ${y})`,
        role:"button",tabindex:"0","aria-label":`Passaggio ${i+1}: ${node[0].replace("|"," ")}`,
        "aria-pressed":"false"
      });
      group.append(make("circle",{r:"52",class:"node-ring"}));
      group.append(make("circle",{r:"9",class:"node-core"}));
      const number = make("text",{x:"0",y:"-72",class:"node-number"});
      number.textContent = String(i+1).padStart(2,"0");
      group.append(number);
      const label = make("text",{x:"0",y:"80"});
      node[0].split("|").forEach((part,j) => {
        const tspan = make("tspan",{x:"0",dy:j ? "20" : "0"});
        tspan.textContent = part;
        label.append(tspan);
      });
      group.append(label);
      group.addEventListener("click", () => selectNode(i));
      group.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {e.preventDefault();selectNode(i);}
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          selectNode((i + (e.key === "ArrowRight" ? 1 : 4)) % 5, true);
        }
      });
      svg.append(group);
    });
    selectNode(0);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => render(tab.dataset.scene));
    tab.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      render(next.dataset.scene);
      next.focus();
    });
  });
  document.querySelector(".next-node").addEventListener("click", () => selectNode((selected + 1) % 5));
  render(sceneName);
})();
