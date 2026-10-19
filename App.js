import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  BackHandler,
  AppState,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// ============================================================
//  MON COACH RUNNING — version Expo (React Native)
//  Les deux URLs de webhook n8n (les mêmes que le web) :
// ============================================================
const N8N = {
  chat: 'https://lfp-digital.app.n8n.cloud/webhook/coach-chat', // ex: https://.../webhook/coach-chat
  data: 'https://lfp-digital.app.n8n.cloud/webhook/coach-data', // ex: https://.../webhook/coach-data
};

// Thème sombre « Material 3 » : fonds en paliers, un seul orange pour l'action.
const C = {
  bg: '#121212', // fond de l'app
  surface: '#1E1E1E', // cartes
  surfaceHi: '#2A2A2A', // bulles du coach, champ de saisie
  nav: '#232323', // barre d'onglets
  line: 'rgba(255,255,255,0.12)',
  text: '#FFFFFF',
  sub: '#B3B3B3',
  faint: '#9E9E9E',
  accent: '#FF6A2B', // orange maison (volontairement différent de celui de Strava)
  accentSoft: 'rgba(255,106,43,0.16)',
  onAccent: '#1A0E08', // texte posé sur l'orange
  barVide: '#3A3A3A',
};

// Échelle typo (Roboto, la police système d'Android) : rôles Material 3.
const T = {
  titre: { fontSize: 24, fontWeight: '700', color: C.text },
  titreCarte: { fontSize: 16, fontWeight: '700', color: C.text },
  section: { fontSize: 16, fontWeight: '500', color: C.text },
  corps: { fontSize: 16, lineHeight: 24, color: C.text },
  second: { fontSize: 14, lineHeight: 20, color: C.sub },
  label: { fontSize: 12, fontWeight: '500', color: C.sub },
  chiffre: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    fontVariant: ['tabular-nums'],
  },
};

const isoLocal = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

// ⚠️ Données de secours (si le webhook data n'est pas joignable)
const SEANCES_DEMO = [
  {
    date: '14 août',
    type: 'Endurance',
    distance: 8.2,
    duree: '45 min',
    allure: '5:29',
    ressenti: 'Bien',
  },
  {
    date: '12 août',
    type: 'Fractionné',
    distance: 6.0,
    duree: '38 min',
    allure: '6:20',
    ressenti: 'Dur',
  },
];
const PROGRAMME_DEMO = [
  {
    jour: "Aujourd'hui",
    type: 'Fractionné',
    detail: '6 × 400m · récup 1 min',
    cible: '4:45',
  },
  {
    jour: 'Jeudi',
    type: 'Endurance',
    detail: '50 min en aisance',
    cible: '5:30',
  },
];
// pas de faux records : sans données, on n'affiche que des « — »
const RECORDS_DEMO = [
  { label: '5 km', valeur: '—' },
  { label: '10 km', valeur: '—' },
];

const DATE_SEMI = new Date('2026-11-08');

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <CoachRunning />
    </SafeAreaProvider>
  );
}

function CoachRunning() {
  const insets = useSafeAreaInsets();
  const [ecran, setEcran] = useState('home');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Salut Dim. Comment tu te sens aujourd'hui ?",
    },
  ]);
  const [promptEnAttente, setPromptEnAttente] = useState(null);
  const [seances, setSeances] = useState(SEANCES_DEMO);
  const [programme, setProgramme] = useState(PROGRAMME_DEMO);
  const [records, setRecords] = useState(RECORDS_DEMO);
  const [source, setSource] = useState('…');
  const aDuCache = useRef(false);

  // Au lancement : on réaffiche tout de suite les dernières vraies données mémorisées
  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('coach_data');
        if (s) {
          const d = JSON.parse(s);
          if (d.seances) setSeances(d.seances);
          if (d.programme) setProgramme(d.programme);
          if (d.records) setRecords(d.records);
          aDuCache.current = true;
        }
      } catch {}
    })();
  }, []);

  // HISTORIQUE : on recharge les derniers messages au démarrage.
  const [histoCharge, setHistoCharge] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('coach_messages');
        // on garde les messages déjà envoyés pendant le chargement
        if (s) setMessages((p) => [...JSON.parse(s), ...p.slice(1)]);
      } catch {}
      setHistoCharge(true);
    })();
  }, []);
  // ... et on les sauvegarde à chaque changement, mais seulement APRÈS
  // le chargement (sinon le message d'accueil écrasait l'historique).
  useEffect(() => {
    if (!histoCharge) return;
    AsyncStorage.setItem('coach_messages', JSON.stringify(messages)).catch(
      () => {}
    );
  }, [messages, histoCharge]);

  // DONNÉES : on va chercher tes vraies séances/records/programme.
  const [rafraichit, setRafraichit] = useState(false);
  async function charger() {
    if (!N8N.data || N8N.data.startsWith('COLLE')) {
      setSource('Démo');
      return;
    }
    setSource('MAJ en cours…');
    try {
      const d = await (await fetch(N8N.data)).json();
      if (d.seances) setSeances(d.seances);
      if (d.programme) setProgramme(d.programme);
      if (d.records) setRecords(d.records);
      await AsyncStorage.setItem('coach_data', JSON.stringify(d));
      aDuCache.current = true;
      setSource('Connecté');
    } catch {
      // pas de réseau : si on a des données mémorisées, ce sont les vraies
      setSource(aDuCache.current ? 'Hors ligne' : 'Démo');
    }
  }
  useEffect(() => {
    charger();
    // au retour dans l'app (ex. juste après une sortie), on recharge
    const sub = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') charger();
    });
    return () => sub.remove();
  }, []);
  async function tirerPourRafraichir() {
    setRafraichit(true);
    await charger();
    setRafraichit(false);
  }
  const rafraichir = (
    <RefreshControl
      refreshing={rafraichit}
      onRefresh={tirerPourRafraichir}
      colors={[C.accent]}
      progressBackgroundColor={C.surfaceHi}
    />
  );

  // Bouton/geste « Retour » d'Android : on revient à l'accueil avant de quitter.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ecran === 'home') return false;
      setEcran('home');
      return true;
    });
    return () => sub.remove();
  }, [ecran]);

  const estChat = ecran === 'chat';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      {!estChat && <EtatDonnees source={source} />}
      {ecran === 'home' && (
        <EcranHome
          rafraichir={rafraichir}
          seances={seances}
          derniere={seances[0]}
          prochaine={programme[indexProchaine(programme)]}
          onProg={() => setEcran('programme')}
          onAnalyse={() => {
            const s = seances[0];
            setPromptEnAttente(
              `Analyse ma dernière séance : ${s.type}, ${s.distance} km en ${s.duree}, allure ${s.allure}/km, ressenti "${s.ressenti}". Retour bref.`
            );
            setEcran('chat');
          }}
        />
      )}
      {ecran === 'programme' && <EcranProgramme programme={programme} />}
      {ecran === 'seances' && (
        <EcranSeances seances={seances} rafraichir={rafraichir} />
      )}
      {ecran === 'records' && <EcranRecords records={records} />}
      {ecran === 'chat' && (
        <EcranChat
          messages={messages}
          setMessages={setMessages}
          promptInitial={promptEnAttente}
          effacePrompt={() => setPromptEnAttente(null)}
          onRetour={() => setEcran('home')}
        />
      )}

      {!estChat && <BoutonCoach onPress={() => setEcran('chat')} />}
      {!estChat && <BarreOnglets ecran={ecran} setEcran={setEcran} />}
    </View>
  );
}

// ============================================================
//  HOME
// ============================================================
function EcranHome({ seances, derniere, prochaine, rafraichir, onProg, onAnalyse }) {
  // --- Semaine en cours : lundi → dimanche ---
  const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const now = new Date();
  const lundi = new Date(now);
  const decal = (now.getDay() + 6) % 7; // 0 = lundi
  lundi.setDate(now.getDate() - decal);
  lundi.setHours(0, 0, 0, 0);

  const semaine = JOURS.map((j, i) => {
    const jour = new Date(lundi);
    jour.setDate(lundi.getDate() + i);
    const iso = isoLocal(jour);
    const km = (seances || [])
      .filter((s) => s.date_iso === iso)
      .reduce((t, s) => t + (s.distance || 0), 0);
    return { j, km, today: iso === isoLocal(now) };
  });

  const totalKm = semaine.reduce((t, d) => t + d.km, 0);
  const nbSeances = semaine.filter((d) => d.km > 0).length;
  const jSemi = Math.max(0, Math.ceil((DATE_SEMI - now) / 86400000));
  const maxKm = Math.max(...semaine.map((x) => x.km), 1);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={rafraichir}
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 16,
        }}>
        <Text style={T.titre}>Salut Dim</Text>
        <Puce>
          Semi 8 nov. · <Text style={{ color: C.text, fontWeight: '700' }}>J-{jSemi}</Text>
        </Puce>
      </View>


      {derniere ? (
        <CarteActivite seance={derniere} titre="Dernière sortie">
          <Pressable
            onPress={onAnalyse}
            hitSlop={4}
            android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 40,
              paddingHorizontal: 16,
              borderRadius: 20,
              overflow: 'hidden',
              marginTop: 14,
              backgroundColor: C.accentSoft,
            }}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={C.accent} />
            <Text style={{ color: C.accent, fontWeight: '600', fontSize: 14, marginLeft: 8, paddingVertical: 8 }}>
              Analyse du coach
            </Text>
          </Pressable>
        </CarteActivite>
      ) : null}

      <Carte>
        <Text style={T.titreCarte}>Cette semaine</Text>
        <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 16 }}>
          <Stat label="Distance" val={totalKm.toFixed(1).replace('.', ',')} unite="km" />
          <Stat label="Sorties" val={`${nbSeances}`} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 76 }}>
          {semaine.map((d, i) => {
            const h = d.km > 0 ? Math.max(8, (d.km / maxKm) * 52) : 3;
            // aujourd'hui : barre orange même vide (petit trait), libellé orange
            const couleur = d.km > 0 || d.today ? C.accent : C.barVide;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                {d.km > 0 ? (
                  <Text style={{ fontSize: 11, color: C.sub, marginBottom: 4, fontVariant: ['tabular-nums'] }}>
                    {d.km.toFixed(1).replace('.', ',')}
                  </Text>
                ) : null}
                <View
                  style={{
                    width: 18,
                    height: h,
                    borderRadius: 4,
                    backgroundColor: couleur,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 6,
                    color: d.today ? C.accent : C.faint,
                    fontWeight: d.today ? '700' : '400',
                  }}>
                  {d.j}
                </Text>
              </View>
            );
          })}
        </View>
      </Carte>

      {prochaine ? (
        <Pressable
          onPress={onProg}
          android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          style={{
            backgroundColor: C.surface,
            borderRadius: 16,
            overflow: 'hidden',
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: C.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
            <Ionicons name="calendar-outline" size={20} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={T.titreCarte}>Prochaine séance</Text>
            <Text style={[T.section, { marginTop: 4 }]}>{prochaine.type}</Text>
            <Text style={[T.second, { marginTop: 2 }]}>
              {[prochaine.jour, valeurUtile(prochaine.detail), valeurUtile(prochaine.cible)]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.faint} />
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

// « — » ou vide = pas d'info à afficher
function valeurUtile(v) {
  if (v === 'TBD') return 'Détail à venir';
  return v && v !== '—' ? v : null;
}

// « Lun. 19/10 » → date du 19 octobre (année en cours, ou suivante en fin d'année)
function dateProgramme(jour) {
  const m = /(\d{1,2})\/(\d{1,2})/.exec(jour || '');
  if (!m) return null;
  const now = new Date();
  const mois = Number(m[2]) - 1;
  let annee = now.getFullYear();
  if (mois < now.getMonth() - 6) annee += 1;
  return new Date(annee, mois, Number(m[1]));
}

// Index de la prochaine séance : la première dont la date est aujourd'hui ou après.
function indexProchaine(programme) {
  const auj = new Date();
  auj.setHours(0, 0, 0, 0);
  const i = programme.findIndex((p) => {
    const d = dateProgramme(p.jour);
    return !d || d >= auj;
  });
  return i === -1 ? programme.length : i;
}

// N'affiche quelque chose que si les données ne sont PAS fraîches.
function EtatDonnees({ source }) {
  if (source === 'Connecté' || source === '…') return null;
  const enCours = source.startsWith('MAJ');
  const texte = enCours
    ? 'Mise à jour des séances…'
    : source === 'Hors ligne'
      ? 'Hors ligne : dernières données mémorisées'
      : 'Données de démonstration (serveur injoignable)';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
      {enCours ? (
        <ActivityIndicator size="small" color={C.sub} style={{ marginRight: 8 }} />
      ) : (
        <Ionicons name="cloud-offline-outline" size={16} color={C.sub} style={{ marginRight: 8 }} />
      )}
      <Text style={T.second}>{texte}</Text>
    </View>
  );
}

// ============================================================
//  PROGRAMME
// ============================================================
function EcranProgramme({ programme }) {
  const iProchaine = indexProchaine(programme);
  return (
    <>
      <EnTete titre="Programme" sousTitre="Tes prochaines séances" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <Carte style={{ paddingVertical: 4 }}>
          {programme.map((p, i) => {
            // séances passées et jours de repos en retrait
            const passee = i < iProchaine;
            const repos = p.type === 'Repos';
            const cible = valeurUtile(p.cible);
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: C.line,
                  opacity: passee || repos ? 0.65 : 1,
                }}>
                <View style={{ width: 84 }}>
                  <Text style={[T.label, { color: i === iProchaine ? C.accent : C.sub }]}>
                    {p.jour}
                  </Text>
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={T.section}>{p.type}</Text>
                  {valeurUtile(p.detail) ? (
                    <Text style={[T.second, { marginTop: 2 }]}>{valeurUtile(p.detail)}</Text>
                  ) : null}
                </View>
                {cible ? (
                  <Text style={[T.section, { fontVariant: ['tabular-nums'] }]}>{cible}</Text>
                ) : null}
              </View>
            );
          })}
        </Carte>
      </ScrollView>
    </>
  );
}

// ============================================================
//  SÉANCES
// ============================================================
function EcranSeances({ seances, rafraichir }) {
  return (
    <>
      <EnTete titre="Séances" sousTitre="Synchronisées avec Strava" />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={rafraichir}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {seances.map((s, i) => (
          <CarteActivite key={i} seance={s} />
        ))}
      </ScrollView>
    </>
  );
}

// ============================================================
//  RECORDS
// ============================================================
function EcranRecords({ records }) {
  return (
    <>
      <EnTete titre="Records" sousTitre="Estimés d'après tes sorties Strava" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {records.map((r, i) => {
            const vide = !valeurUtile(r.valeur);
            return (
              <View
                key={i}
                style={{
                  width: '48.5%',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  backgroundColor: C.surface,
                }}>
                <Text style={T.label}>{r.label}</Text>
                <Text
                  style={[
                    T.chiffre,
                    { fontSize: 24, marginTop: 6, color: vide ? C.faint : C.text },
                  ]}>
                  {vide ? '—' : r.valeur}
                </Text>
                {vide ? <Text style={[T.second, { marginTop: 2 }]}>Pas encore</Text> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}

// ============================================================
//  CHAT  (input géré par KeyboardAvoidingView → plus de bug clavier)
// ============================================================
function EcranChat({
  messages,
  setMessages,
  promptInitial,
  effacePrompt,
  onRetour,
}) {
  const [saisie, setSaisie] = useState('');
  const [enCours, setEnCours] = useState(false);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [clavierOuvert, setClavierOuvert] = useState(false);

  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setClavierOuvert(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setClavierOuvert(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  useEffect(() => {
    if (promptInitial) {
      envoyer(promptInitial);
      effacePrompt();
    }
  }, []);

  async function envoyer(texteForce) {
    const texte = (texteForce || saisie).trim();
    if (!texte || enCours) return;
    const nouveaux = [...messages, { role: 'user', content: texte }];
    setMessages(nouveaux);
    setSaisie('');
    setEnCours(true);
    try {
      const d = await (
        await fetch(N8N.chat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: texte, userId: 'dim' }),
        })
      ).json();
      setMessages((p) => [
        ...p,
        { role: 'assistant', content: d.reply || '…' },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: 'assistant',
          content: "Je n'ai pas reçu ton message (réseau ?). Renvoie-le dans un instant.",
        },
      ]);
    } finally {
      setEnCours(false);
    }
  }

  const peutEnvoyer = saisie.trim().length > 0 && !enCours;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // Android en plein écran (edge-to-edge, SDK 55) : l'écran ne se
      // redimensionne plus tout seul → on pousse aussi avec "padding".
      behavior="padding">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 64,
          paddingHorizontal: 4,
        }}>
        <Pressable
          onPress={onRetour}
          accessibilityLabel="Retour"
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </Pressable>
        <Text style={[T.titreCarte, { fontSize: 20, marginLeft: 4 }]}>Coach</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }>
        {messages.map((m, i) => {
          const moi = m.role === 'user';
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: moi ? 'flex-end' : 'flex-start',
                marginBottom: 8,
              }}>
              <View
                style={{
                  maxWidth: '82%',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  borderBottomRightRadius: moi ? 6 : 18,
                  borderBottomLeftRadius: moi ? 18 : 6,
                  backgroundColor: moi ? C.accent : C.surfaceHi,
                }}>
                <Text style={[T.corps, { color: moi ? C.onAccent : C.text }]}>
                  {m.content}
                </Text>
              </View>
            </View>
          );
        })}
        {enCours && (
          <Text style={[T.second, { marginTop: 4 }]}>Le coach écrit…</Text>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 12,
          paddingTop: 8,
          // clavier fermé : on laisse la place à la barre de navigation Android
          paddingBottom: clavierOuvert ? 8 : 8 + insets.bottom,
          // le bouton reste en bas quand le champ grandit
          alignItems: 'flex-end',
        }}>
        <TextInput
          value={saisie}
          onChangeText={setSaisie}
          // plusieurs lignes : le texte s'agrandit jusqu'à ~5 lignes,
          // Entrée = retour à la ligne, on envoie avec le bouton.
          multiline
          placeholder="Écris à ton coach…"
          placeholderTextColor={C.faint}
          cursorColor={C.accent}
          selectionColor={C.accentSoft}
          style={{
            flex: 1,
            minHeight: 48,
            maxHeight: 120,
            textAlignVertical: 'top',
            paddingTop: 13,
            paddingBottom: 13,
            paddingHorizontal: 18,
            borderRadius: 24,
            backgroundColor: C.surfaceHi,
            color: C.text,
            fontSize: 15,
            marginRight: 8,
          }}
        />
        <Pressable
          onPress={() => envoyer()}
          disabled={!peutEnvoyer}
          accessibilityLabel="Envoyer"
          android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: true, radius: 24 }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: peutEnvoyer ? C.accent : C.surfaceHi,
          }}>
          <Ionicons name="send" size={20} color={peutEnvoyer ? C.onAccent : C.faint} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
//  BRIQUES
// ============================================================
function Carte({ children, style }) {
  return (
    <View
      style={[
        { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
        style,
      ]}>
      {children}
    </View>
  );
}

// Carte d'une sortie Strava : titre, date, puis Distance / Durée / Allure.
function CarteActivite({ seance, titre, children }) {
  return (
    <Carte>
      {titre ? <Text style={[T.titreCarte, { marginBottom: 4 }]}>{titre}</Text> : null}
      <Text style={titre ? T.section : T.titreCarte} numberOfLines={2}>
        {seance.type}
      </Text>
      <Text style={[T.second, { marginTop: 2 }]}>{seance.date}</Text>
      <View style={{ flexDirection: 'row', marginTop: 14 }}>
        <Stat label="Distance" val={String(seance.distance).replace('.', ',')} unite="km" />
        <Stat label="Durée" val={seance.duree} />
        <Stat label="Allure" val={seance.allure} unite="/km" />
      </View>
      {seance.ressenti ? (
        <Text style={[T.second, { marginTop: 12 }]}>
          Ressenti : <Text style={{ color: C.text }}>{seance.ressenti}</Text>
          {' '}(estimé via la FC)
        </Text>
      ) : null}
      {children}
    </Carte>
  );
}

function Stat({ label, val, unite }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={T.label}>{label}</Text>
      <Text style={[T.chiffre, { marginTop: 2 }]}>
        {val}
        {unite ? (
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.sub }}> {unite}</Text>
        ) : null}
      </Text>
    </View>
  );
}

function Puce({ children }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: C.line,
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
      }}>
      <Text style={{ fontSize: 13, color: C.sub, fontVariant: ['tabular-nums'] }}>
        {children}
      </Text>
    </View>
  );
}

function EnTete({ titre, sousTitre }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
      <Text style={T.titre}>{titre}</Text>
      <Text style={[T.second, { marginTop: 4 }]}>{sousTitre}</Text>
    </View>
  );
}

// Bouton flottant (FAB Material 3) pour ouvrir le chat depuis partout.
function BoutonCoach({ onPress }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Parler au coach"
      android_ripple={{ color: 'rgba(0,0,0,0.16)', borderless: false }}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 16,
        bottom: insets.bottom + 96,
        zIndex: 10,
        width: 56,
        height: 56,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: pressed ? 2 : 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      })}>
      <Ionicons name="chatbubble-ellipses" size={24} color={C.onAccent} />
    </Pressable>
  );
}

// Barre d'onglets Material 3 : pastille derrière l'icône active.
function BarreOnglets({ ecran, setEcran }) {
  const insets = useSafeAreaInsets();
  const onglets = [
    { id: 'home', icone: 'home', label: 'Accueil' },
    { id: 'programme', icone: 'calendar', label: 'Programme' },
    { id: 'seances', icone: 'list', label: 'Séances' },
    { id: 'records', icone: 'trophy', label: 'Records' },
  ];
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: C.nav,
        paddingTop: 12,
        paddingBottom: insets.bottom + 12,
      }}>
      {onglets.map(({ id, icone, label }) => {
        const actif = ecran === id;
        return (
          <Pressable
            key={id}
            onPress={() => setEcran(id)}
            android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: true, radius: 32 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}
            style={{ flex: 1, alignItems: 'center' }}>
            <View
              // « key » force Android à redessiner la pastille arrondie
              // (sinon elle restait carrée en changeant d'onglet)
              key={actif ? 'actif' : 'inactif'}
              style={{
                width: 64,
                height: 32,
                borderRadius: 16,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: actif ? C.accentSoft : 'transparent',
              }}>
              <Ionicons
                name={actif ? icone : `${icone}-outline`}
                size={22}
                color={actif ? C.accent : C.sub}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: actif ? '700' : '500',
                color: actif ? C.text : C.sub,
                marginTop: 4,
              }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
