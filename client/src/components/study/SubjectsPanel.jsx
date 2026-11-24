import { useState } from 'react';
import { BookMarked, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { Field, Input, Textarea } from '../ui/FormControls.jsx';
import useCollection from '../../hooks/useCollection.js';
import { CHART_COLORS } from '../../utils/constants.js';

const empty = () => ({ name: '', code: '', instructor: '', color: CHART_COLORS[0] });

const SubjectsPanel = ({ onChanged }) => {
  const subjects = useCollection('/subjects');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const { initial, form } = modal;
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const payload = { name: form.name.trim(), code: form.code, instructor: form.instructor, color: form.color };
      if (initial) await subjects.update(initial._id, payload, 'Subject updated');
      else await subjects.create(payload, 'Subject added');
      setModal(null);
      onChanged?.();
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await subjects.remove(confirm.id, 'Subject deleted');
      setConfirm(null);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Subjects & courses"
        subtitle="The academic areas you are studying"
        icon={BookMarked}
        action={
          <Button size="sm" icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
            Add subject
          </Button>
        }
      />
      <div className="p-4">
        {subjects.items.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.items.map((s) => (
              <div key={s._id} className="group relative overflow-hidden rounded-xl border border-sand-200 bg-cream-50 p-4">
                <span className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: s.color }} />
                <div className="ps-2">
                  <p className="font-display text-base font-semibold text-espresso-900">{s.name}</p>
                  <p className="mt-0.5 text-xs text-taupe-500">
                    {[s.code, s.instructor].filter(Boolean).join(' · ') || 'No code or instructor'}
                  </p>
                </div>
                <div className="mt-3 flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => setModal({ initial: s, form: { name: s.name, code: s.code || '', instructor: s.instructor || '', color: s.color } })}
                    className="rounded-md p-1.5 text-taupe-400 hover:bg-sand-100 hover:text-espresso-700"
                    aria-label="Edit subject"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ id: s._id, title: s.name })}
                    className="rounded-md p-1.5 text-taupe-400 hover:bg-terracotta-500/10 hover:text-terracotta-600"
                    aria-label="Delete subject"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookMarked}
            title="No subjects yet"
            description="Add your courses to organise study tasks, sessions and deadlines."
            action={
              <Button icon={Plus} variant="accent" onClick={() => setModal({ initial: null, form: empty() })}>
                Add subject
              </Button>
            }
          />
        )}
      </div>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.initial ? 'Edit subject' : 'Add subject'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={busy}>
              {modal?.initial ? 'Save changes' : 'Add subject'}
            </Button>
          </>
        }
      >
        {modal && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Subject name" required>
              <Input value={modal.form.name} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))} placeholder="e.g. Algorithms" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code">
                <Input value={modal.form.code} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, code: e.target.value } }))} placeholder="e.g. CS201" />
              </Field>
              <Field label="Instructor">
                <Input value={modal.form.instructor} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, instructor: e.target.value } }))} placeholder="e.g. Dr. Haddad" />
              </Field>
            </div>
            <Field label="Colour">
              <div className="flex flex-wrap gap-2">
                {CHART_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setModal((m) => ({ ...m, form: { ...m.form, color: c } }))}
                    className="grid h-8 w-8 place-items-center rounded-lg border transition"
                    style={{ backgroundColor: c, borderColor: modal.form.color === c ? '#33414F' : 'transparent' }}
                    aria-label={`Colour ${c}`}
                  >
                    {modal.form.color === c && <Check size={14} className="text-cream-50" />}
                  </button>
                ))}
              </div>
            </Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
        loading={busy}
        title="Delete subject?"
        message={`“${confirm?.title}” will be deleted. Linked tasks and sessions will keep their data but lose the subject link.`}
      />
    </Card>
  );
};

export default SubjectsPanel;
