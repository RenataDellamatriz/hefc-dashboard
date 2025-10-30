"use client";

import { useCallback, useEffect, useState } from "react";
import { WithAdminAuth } from "@/components/hoc/with-admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderSpinner } from "@/components/common/loader-spinner";
import { toast } from "sonner";
import { deleteUser, getAllUsers } from "@/api";
import { User } from "@/types/user";
import { Users } from "lucide-react";

const UsuariosCadastradosPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast("Erro ao carregar usuários cadastrados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = useCallback(
    async (userId: string) => {
      try {
        setDeletingId(userId);
        await deleteUser(userId);
        toast("Usuário excluído com sucesso.");
        await fetchUsers();
      } catch (error) {
        toast("Erro ao excluir usuário.");
      } finally {
        setDeletingId(null);
      }
    },
    [fetchUsers]
  );

  return (
    <WithAdminAuth>
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ver usuários cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoaderSpinner /> Carregando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Nome</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Papel</th>
                      <th className="py-2 pr-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="py-2 pr-4">{u.name}</td>
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4 capitalize">{u.role}</td>
                        <td className="py-2 pr-4">
                          {u.role === "collaborator" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingId === u.id}
                              onClick={() => handleDelete(u.id)}
                            >
                              {deletingId === u.id ? (
                                <span className="flex items-center gap-2">
                                  <LoaderSpinner /> Excluindo...
                                </span>
                              ) : (
                                "Excluir"
                              )}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Sem ações</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          Nenhum usuário cadastrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WithAdminAuth>
  );
};

export default UsuariosCadastradosPage;


