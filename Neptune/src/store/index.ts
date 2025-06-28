import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { LazyStore } from '@tauri-apps/plugin-store';
import { LocalReposSlice, SessionSlice, UiSlice } from '../types/Repository';

const FILE = 'neptune.json';
const TAURI = new LazyStore(FILE);

const tauriStorage = {
    getItem: async (k: string) => {
        const value = await TAURI.get<string>(k);
        return value ? JSON.parse(value) : null;
    },
    setItem: async (k: string, v: any) => { 
        await TAURI.set(k, JSON.stringify(v)); 
        await TAURI.save(); 
    },
    removeItem: async (k: string) => { 
        await TAURI.delete(k); 
        await TAURI.save(); 
    },
  };

  export const useNeptuneStore = create<SessionSlice & LocalReposSlice & UiSlice>()(
    persist(
      immer<SessionSlice & LocalReposSlice & UiSlice>((set, get) => ({
        /* session defaults */
        user: undefined,
        plan: 'free',
        hasToken: false,
  
        setUser:     (u) => set({ user: u }),
        setPlan:     (p) => set({ plan: p }),
        setHasToken: (v) => set({ hasToken: v }),
        clear: ()           => set({ user: undefined, plan: 'free', hasToken: false }),
  
        /* local repo defaults */
        local: {},
  
        addRepo: (id, name) =>
          set(s => { if (!s.local[id]) s.local[id] = { repoName:name, authorList:[], isWatching:false }; }),
  
        linkPath: (id, p) =>
          set(s => { if (s.local[id]) s.local[id].localPath = p; }),
  
        setDag: (id, dag) =>
          set(s => {
            if (!s.local[id]) return;
            s.local[id].commitDag  = dag;
            s.local[id].commitMap  = Object.fromEntries(dag.map(c => [c.commit, c]));
          }),
  
        setAuthorList: (id, a) =>
          set(s => { if (s.local[id]) s.local[id].authorList = a; }),
  
        setWatching: (id, on) =>
          set(s => { if (s.local[id]) s.local[id].isWatching = on; }),
  
        getCommit: (id, sha) => get().local[id]?.commitMap?.[sha],

        /* ui defaults */
        selectedRepos: [],
        openTabs: [],
        activeTab: undefined,

        /* sidebar actions */
        addRepoToUI: (id) =>
          set(s => { if (!s.selectedRepos.includes(id)) s.selectedRepos.push(id); }),

        removeRepoFromUI: (id) =>
          set(s => {
            s.selectedRepos = s.selectedRepos.filter(r => r !== id);
            /* also remove from tabs if open */
            s.openTabs     = s.openTabs.filter(t => t !== id);
            if (s.activeTab === id) s.activeTab = s.openTabs[s.openTabs.length - 1];
          }),

        /* tab actions */
        openTab: (id) =>
          set(s => {
            if (!s.openTabs.includes(id)) s.openTabs.push(id);
            s.activeTab = id;
          }),

        closeTab: (id) =>
          set(s => {
            s.openTabs = s.openTabs.filter(t => t !== id);
            if (s.activeTab === id) s.activeTab = s.openTabs[s.openTabs.length - 1];
          }),

        setActive: (id) =>
          set(s => { if (s.openTabs.includes(id)) s.activeTab = id; }),

        moveTab: (id, idx) =>
          set(s => {
            const pos = s.openTabs.indexOf(id);
            if (pos === -1) return;
            s.openTabs.splice(pos, 1);
            s.openTabs.splice(idx, 0, id);
          }),
      })),
      {
        name: 'neptune-v1',
        storage: tauriStorage,
  
        /* Persist only lightweight fields */
        partialize: (state) => ({
          user: state.user,
          plan: state.plan,
          hasToken: state.hasToken,
          local: Object.fromEntries(
            Object.entries(state.local).map(([id, r]) => [
              id,
              {
                repoName:   r.repoName,
                localPath:  r.localPath,
                authorList: r.authorList,
                isWatching: r.isWatching,
                commitDag:  r.commitDag?.map(c => ({
                  commit:   c.commit,
                  parents:  c.parents,
                  branches: c.branches,
                  author:   c.author,
                  date:     c.date,
                  message:  c.message,
                })),
                // commitMap intentionally skipped
              },
            ])
          ),
          /* ui */
          selectedRepos: state.selectedRepos,
          openTabs:      state.openTabs,
          activeTab:     state.activeTab,
        } as SessionSlice & LocalReposSlice & UiSlice),
      }
    )
  );
  
  /* handy hooks for components */
  export const useSession      = () => useNeptuneStore(s => s as SessionSlice);
  export const useLocalRepos   = () => useNeptuneStore(s => s as LocalReposSlice);
  export const useUI           = () => useNeptuneStore(s => s as UiSlice);