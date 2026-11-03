import { useMemo, useState } from "react";
import { Gamepad2, Plus, SearchX } from "lucide-react";
import type { Game, GameInput } from "@/lib/types";
import { useLibrary } from "@/contexts/GamesContext";
import { applyQuery, countByStatus, listPlatforms } from "@/lib/filters";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useToast } from "@/components/ui/Toast";
import { GameCard } from "@/components/games/GameCard";
import { GameForm } from "@/components/games/GameForm";
import { GameFilters, type FiltersState } from "@/components/games/GameFilters";

const INITIAL_FILTERS: FiltersState = {
  search: "",
  status: "all",
  platform: "all",
  sort: "recent",
};

export default function Library() {
  const { games, loading, error, createGame, updateGame, deleteGame, reload } =
    useLibrary();
  const toast = useToast();

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState(false);

  const platforms = useMemo(() => listPlatforms(games), [games]);
  const counts = useMemo(() => countByStatus(games), [games]);
  const visible = useMemo(() => applyQuery(games, filters), [games, filters]);

  const filtersActive =
    filters.search !== "" || filters.status !== "all" || filters.platform !== "all";

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (game: Game) => {
    setEditing(game);
    setFormOpen(true);
  };

  const handleSubmit = async (input: GameInput) => {
    const result = editing
      ? await updateGame(editing.id, input)
      : await createGame(input);

    if (!result.error) {
      setFormOpen(false);
      setEditing(null);
      toast.success(
        editing ? "Jogo atualizado." : `${input.name.trim()} entrou na biblioteca.`,
      );
    }
    return result;
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error: deleteError } = await deleteGame(pendingDelete.id);
    setDeleting(false);
    if (deleteError) {
      toast.error("Não foi possível excluir o jogo.");
      return;
    }
    toast.success(`${pendingDelete.name} foi removido.`);
    setPendingDelete(null);
  };

  if (loading) return <PageLoader label="Carregando sua biblioteca..." />;

  return (
    <>
      <SectionHeader
        title="Minha biblioteca"
        description={
          games.length === 0
            ? "Comece cadastrando o primeiro jogo."
            : `${games.length} ${games.length === 1 ? "jogo cadastrado" : "jogos cadastrados"}.`
        }
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar jogo
          </Button>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-lg border border-red-900/70 bg-red-950/40 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void reload()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {games.length > 0 && (
        <div className="mb-6">
          <GameFilters
            value={filters}
            onChange={setFilters}
            platforms={platforms}
            counts={counts}
          />
        </div>
      )}

      {games.length === 0 ? (
        <EmptyState
          icon={<Gamepad2 className="h-5 w-5" />}
          title="Sua biblioteca está vazia"
          description="Cadastre manualmente qualquer jogo, de qualquer plataforma. Nome e status já são suficientes para começar."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar o primeiro jogo
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-5 w-5" />}
          title="Nenhum jogo encontrado"
          description="Nenhum registro corresponde à busca e aos filtros selecionados."
          action={
            filtersActive && (
              <Button variant="secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
                Limpar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-ink-faint" aria-live="polite">
            Exibindo {visible.length} de {games.length}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Editar jogo" : "Adicionar jogo"}
        description={
          editing
            ? "Atualize os dados deste registro."
            : "Apenas o nome é obrigatório. O resto você preenche quando quiser."
        }
      >
        <GameForm
          game={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir jogo"
        description={`"${pendingDelete?.name}" será removido da sua biblioteca. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
