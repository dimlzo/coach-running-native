import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";

// mêmes icônes qu'avant, mais fournies d'office par Expo (rien à installer)
const Home = (p) => <Ionicons name="home-outline" {...p} />;
const CalendarDays = (p) => <Ionicons name="calendar-outline" {...p} />;
const Activity = (p) => <Ionicons name="pulse-outline" {...p} />;
const Trophy = (p) => <Ionicons name="trophy-outline" {...p} />;
const MessageCircle = (p) => <Ionicons name="chatbubble-outline" {...p} />;
const ArrowLeft = (p) => <Ionicons name="arrow-back" {...p} />;
const Sparkles = (p) => <Ionicons name="sparkles-outline" {...p} />;
const ChevronRight = (p) => <Ionicons name="chevron-forward" {...p} />;

// ============================================================
//  MON COACH RUNNING — version Expo (React Native)
//  👉 Colle tes deux URLs de webhook n8n (les mêmes que le web) :
// ============================================================
const N8N = {
  chat: 'https://lfp-digital.app.n8n.cloud/webhook/coach-chat', // ex: https://.../webhook/coach-chat
  data: 'https://lfp-digital.app.n8n.cloud/webhook/coach-data', // ex: https://.../webhook/coach-data
};

const C = {
  bg: '#0A0910',
  surface: '#141219',
  surfaceHi: '#1A1822',
  line: 'rgba(255,255,255,0.08)',
  text: '#F4F3F7',
  sub: '#9E9BAA',
  faint: '#68656F',
  accent: '#8E86FF',
};

const isoLocal = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
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
const RECORDS_DEMO = [
  { label: '5 km', valeur: '22:30' },
  { label: '10 km', valeur: '47:10' },
  { label: 'Km total', valeur: '128' },
  { label: 'Sorties', valeur: '17' },
];

function Micro({ children, style }) {
  return (
    <Text
      style={[
        {
          fontSize: 10.5,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: C.faint,
          fontWeight: '600',
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

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

// Au lancement : on réaffiche tout de suite les dernières vraies données mémorisées
useEffect(() => {
  (async () => {
    try {
      const s = await AsyncStorage.getItem("coach_data");
      if (s) {
        const d = JSON.parse(s);
        if (d.seances) setSeances(d.seances);
        if (d.programme) setProgramme(d.programme);
        if (d.records) setRecords(d.records);
        setSource("Connecté");
      }
    } catch {}
  })();
}, []);

  const [source, setSource] = useState('…');

  // HISTORIQUE : on recharge les derniers messages au démarrage.
  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem('coach_messages');
        if (s) setMessages(JSON.parse(s));
      } catch {}
    })();
  }, []);
  // ... et on les sauvegarde à chaque changement.
  useEffect(() => {
    AsyncStorage.setItem('coach_messages', JSON.stringify(messages)).catch(
      () => {}
    );
  }, [messages]);

  // DONNÉES : on va chercher tes vraies séances/records/programme.
  useEffect(() => {
    if (!N8N.data || N8N.data.startsWith('COLLE')) {
      setSource('Démo');
      return;
    }
    (async () => {
      setSource("MAJ en cours…");
const d = await (await fetch(N8N.data)).json();
      try {
        const d = await (await fetch(N8N.data)).json();
        if (d.seances) setSeances(d.seances);
        if (d.programme) setProgramme(d.programme);
        if (d.records) setRecords(d.records);
        await AsyncStorage.setItem("coach_data", JSON.stringify(d));
        setSource('Connecté');
      } catch {
        setSource('Démo');
      }
    })();
  }, []);

  const estChat = ecran === 'chat';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      {ecran === 'home' && (
        <EcranHome
          seances={seances}
          derniere={seances[0]}
          prochaine={programme[0]}
          source={source}
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
      {ecran === 'seances' && <EcranSeances seances={seances} />}
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

      {!estChat && <BulleCoach onPress={() => setEcran('chat')} />}
      {!estChat && <BarreOnglets ecran={ecran} setEcran={setEcran} />}
    </View>
  );
}

// ============================================================
//  HOME
// ============================================================
function EcranHome({ seances, derniere, prochaine, source, onProg, onAnalyse }) {
  // --- Semaine en cours : lundi → dimanche ---
const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const now = new Date();
const lundi = new Date(now);
const decal = (now.getDay() + 6) % 7;            // 0 = lundi
lundi.setDate(now.getDate() - decal);
lundi.setHours(0, 0, 0, 0);

const semaine = JOURS.map((j, i) => {
  const jour = new Date(lundi);
  jour.setDate(lundi.getDate() + i);
  const iso = isoLocal(jour);
  const km = (seances || [])
    .filter(s => s.date_iso === iso)
    .reduce((t, s) => t + (s.distance || 0), 0);
  const estAujourdhui = iso === isoLocal(now);
  return { j, km, today: estAujourdhui };
});

const totalKm = semaine.reduce((t, d) => t + d.km, 0).toFixed(1);
const nbSeances = semaine.filter(d => d.km > 0).length;
const jSemi = Math.max(0, Math.ceil((new Date("2026-11-08") - now) / 86400000)
);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingBottom: 120 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}>
        <View>
          <Micro>Semi-marathon · 8 nov.</Micro>
          <Text
            style={{
              fontSize: 25,
              fontWeight: '800',
              letterSpacing: -0.6,
              color: C.text,
              marginTop: 3,
            }}>
            Salut Dim
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, marginTop: 4 }}>
  {source === "MAJ en cours" && <ActivityIndicator size="small" color={C.sub} style={{ marginRight: 5, transform: [{ scale: 0.7 }] }} />}
  <Text style={{ fontSize: 10.5, color: C.sub }}>{source === "MAJ en cours" ? "MAJ en cours" : source}</Text>
</View>
      </View>

      <Micro style={{ marginBottom: 8 }}>Dernière séance</Micro>
      <View
        style={{
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 18,
          padding: 16,
          marginBottom: 22,
          backgroundColor: C.surface,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
          <Text style={{ fontSize: 15.5, fontWeight: '700', color: C.text }}>
            {derniere?.type}
          </Text>
          <Text style={{ fontSize: 12.5, color: C.faint }}>
            {derniere?.date}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Text style={{ fontSize: 13.5, color: C.sub, marginRight: 16 }}>
            {derniere?.distance} km
          </Text>
          <Text style={{ fontSize: 13.5, color: C.sub, marginRight: 16 }}>
            {derniere?.duree}
          </Text>
          <Text style={{ fontSize: 13.5, color: C.sub }}>
            {derniere?.allure}/km
          </Text>
        </View>
        <Pressable
          onPress={onAnalyse}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 13 }}>
          <Sparkles size={15} color={C.accent} />
          <Text
            style={{
              color: C.accent,
              fontWeight: '600',
              fontSize: 13.5,
              marginLeft: 6,
            }}>
            Analyse rapide
          </Text>
        </Pressable>
      </View>

      <Micro style={{ marginBottom: 10 }}>Cette semaine</Micro>
      <View
        style={{
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 18,
          padding: 18,
          marginBottom: 22,
          backgroundColor: C.surface,
        }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Stat val={`${totalKm}`} unit="km" />
          <Stat val={`${nbSeances}`} unit="séances" />
          <Stat val={`J-${jSemi}`} unit="objectif" />
        </View>
        <View
          style={{ flexDirection: 'row', alignItems: 'flex-end', height: 58 }}>
          {semaine.map((d, i) => {
            const max = Math.max(...semaine.map((x) => x.km), 1);
            const h = d.km > 0 ? Math.max(6, (d.km / max) * 48) : 3;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View
                  style={{
                    width: '70%',
                    height: h,
                    borderRadius: 3,
                    backgroundColor:
                      d.km > 0
                        ? d.today
                          ? C.accent
                          : 'rgba(142,134,255,0.34)'
                        : 'rgba(255,255,255,0.06)',
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: d.today ? C.accent : C.faint,
                    marginTop: 6,
                  }}>
                  {d.j}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

<Micro style={{ marginBottom: 8 }}>Prochaine séance</Micro>
      <Pressable onPress={onProg} style={{ marginBottom: 22 }}>
        <LinearGradient
          colors={['#241F3A', '#17151F']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.line,
            padding: 18,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 19, fontWeight: '800', color: C.text }}>
                {prochaine?.type}
              </Text>
              <Text style={{ fontSize: 12.5, color: C.sub }}>
                {' '}
                · {prochaine?.jour}
              </Text>
            </View>
            <Text style={{ fontSize: 13.5, color: C.sub, marginTop: 3 }}>
              {prochaine?.detail}
            </Text>
            {prochaine?.cible && prochaine.cible !== '—' ? (
              <Text style={{ fontSize: 12.5, color: C.accent, marginTop: 7 }}>
                Cible {prochaine.cible}
              </Text>
            ) : null}
          </View>
          <ChevronRight size={20} color={C.faint} />
        </LinearGradient>
      </Pressable>

    </ScrollView>
  );
}

function Stat({ val, unit }) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          letterSpacing: -0.5,
          color: C.text,
        }}>
        {val}
      </Text>
      <Text style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{unit}</Text>
    </View>
  );
}

// ============================================================
//  PROGRAMME
// ============================================================
function EcranProgramme({ programme }) {
  return (
    <>
      <EnTete titre="Programme" sousTitre="Cette semaine" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}>
        {programme.map((p, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: i < programme.length - 1 ? 1 : 0,
              borderBottomColor: C.line,
            }}>
            <View
              style={{
                width: 3,
                height: 34,
                borderRadius: 3,
                backgroundColor: p.type === 'Repos' ? C.line : C.accent,
                marginRight: 14,
              }}
            />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}>
                <Text
                  style={{ fontWeight: '700', fontSize: 15, color: C.text }}>
                  {p.type}
                </Text>
                <Text style={{ fontSize: 12.5, color: C.faint }}>{p.jour}</Text>
              </View>
              <Text style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>
                {p.detail}
                {p.cible && p.cible !== '—' ? ` · Cible ${p.cible}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ============================================================
//  SÉANCES
// ============================================================
function EcranSeances({ seances }) {
  const teinte = {
    Plaisir: 0.35,
    Bien: 0.55,
    Normal: 0.75,
    Dur: 0.9,
    Horrible: 1,
  };
  return (
    <>
      <EnTete titre="Séances" sousTitre="Synchronisées avec Strava" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}>
        {seances.map((s, i) => (
          <View
            key={i}
            style={{
              paddingVertical: 15,
              borderBottomWidth: i < seances.length - 1 ? 1 : 0,
              borderBottomColor: C.line,
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: C.text }}>
                {s.type}
              </Text>
              <Text style={{ fontSize: 12.5, color: C.faint }}>{s.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={{ fontSize: 13.5, color: C.sub, marginRight: 16 }}>
                {s.distance} km
              </Text>
              <Text style={{ fontSize: 13.5, color: C.sub, marginRight: 16 }}>
                {s.duree}
              </Text>
              <Text style={{ fontSize: 13.5, color: C.sub }}>
                {s.allure}/km
              </Text>
            </View>
            {s.ressenti ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 9,
                }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: C.accent,
                    opacity: teinte[s.ressenti] || 0.5,
                    marginRight: 6,
                  }}
                />
                <Micro style={{ color: C.sub }}>{s.ressenti}</Micro>
              </View>
            ) : null}
          </View>
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
      <EnTete titre="Records" sousTitre="Tes meilleures perfs" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 120 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
          {records.map((r, i) => (
            <View
              key={i}
              style={{
                width: '48.5%',
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: 16,
                padding: 16,
                marginBottom: 10,
                backgroundColor: C.surface,
              }}>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: '800',
                  letterSpacing: -0.8,
                  color: C.text,
                }}>
                {r.valeur}
              </Text>
              <Micro style={{ marginTop: 5, color: C.sub }}>{r.label}</Micro>
            </View>
          ))}
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
        { role: 'assistant', content: 'Oups, réessaie.' },
      ]);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.line,
        }}>
        <Pressable onPress={onRetour} style={{ marginRight: 12 }}>
          <ArrowLeft size={22} color={C.text} />
        </Pressable>
        <View>
          <Text style={{ fontWeight: '700', fontSize: 15.5, color: C.text }}>
            Coach
          </Text>
          <Micro style={{ color: C.sub, marginTop: 1 }}>en ligne</Micro>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
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
                marginBottom: 10,
              }}>
              <View
                style={{
                  maxWidth: '82%',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 15,
                  backgroundColor: moi ? C.accent : C.surfaceHi,
                  borderWidth: moi ? 0 : 1,
                  borderColor: C.line,
                }}>
                <Text
                  style={{
                    fontSize: 14.5,
                    lineHeight: 21,
                    color: moi ? '#0A0910' : C.text,
                  }}>
                  {m.content}
                </Text>
              </View>
            </View>
          );
        })}
        {enCours && <Micro style={{ color: C.sub }}>le coach réfléchit…</Micro>}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: C.line,
          alignItems: 'center',
        }}>
        <TextInput
          value={saisie}
          onChangeText={setSaisie}
          onSubmitEditing={() => envoyer()}
          placeholder="Écris à ton coach…"
          placeholderTextColor={C.faint}
          returnKeyType="send"
          style={{
            flex: 1,
            paddingVertical: 11,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.line,
            backgroundColor: C.surface,
            color: C.text,
            fontSize: 14.5,
            marginRight: 8,
          }}
        />
        <Pressable
          onPress={() => envoyer()}
          disabled={enCours}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: C.accent,
          }}>
          <Text style={{ color: '#0A0910', fontWeight: '700' }}>Go</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================
//  BRIQUES
// ============================================================
function EnTete({ titre, sousTitre }) {
  return (
    <View style={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 12 }}>
      <Text
        style={{
          fontSize: 23,
          fontWeight: '800',
          letterSpacing: -0.5,
          color: C.text,
        }}>
        {titre}
      </Text>
      <Micro style={{ color: C.sub, marginTop: 3 }}>{sousTitre}</Micro>
    </View>
  );
}

function BulleCoach({ onPress }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        right: 18,
        bottom: insets.bottom + 78,
        zIndex: 10,
        width: 56,
        height: 56,
        borderRadius: 999,
        backgroundColor: C.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.accent,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}>
      <MessageCircle size={24} color="#0A0910" strokeWidth={2.2} />
    </Pressable>
  );
}

function BarreOnglets({ ecran, setEcran }) {
  const insets = useSafeAreaInsets();
  const onglets = [
    { id: 'home', Icone: Home, label: 'Accueil' },
    { id: 'programme', Icone: CalendarDays, label: 'Prog' },
    { id: 'seances', Icone: Activity, label: 'Séances' },
    { id: 'records', Icone: Trophy, label: 'Records' },
  ];
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: C.line,
        backgroundColor: C.bg,
        paddingTop: 8,
        paddingBottom: insets.bottom + 10,
      }}>
      {onglets.map(({ id, Icone, label }) => {
        const actif = ecran === id;
        return (
          <Pressable
            key={id}
            onPress={() => setEcran(id)}
            style={{ flex: 1, alignItems: 'center' }}>
            <Icone
              size={21}
              color={actif ? C.accent : C.faint}
              strokeWidth={actif ? 2.2 : 1.75}
            />
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: actif ? '600' : '500',
                color: actif ? C.accent : C.faint,
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
