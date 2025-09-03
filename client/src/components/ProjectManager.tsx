import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Link, FileVideo, Download, Package } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProjectManagerProps {
  clientId: string;
  clientName: string;
}

interface DownloadLink {
  id?: string;
  title: string;
  url: string;
  size?: string;
}

export default function ProjectManager({ clientId, clientName }: ProjectManagerProps) {
  const { toast } = useToast();
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showManageLinks, setShowManageLinks] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [newLink, setNewLink] = useState<DownloadLink>({ title: '', url: '' });

  // Fetch projects for client
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [`/api/projects/client/${clientId}`],
    queryFn: async () => {
      const response = await fetch(`/api/projects/client/${clientId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar proyectos');
      return response.json();
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (project: any) => {
      const response = await apiRequest('POST', '/api/projects', project);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/client/${clientId}`] });
      setShowAddProject(false);
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente",
      });
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      const message = error?.message || "No se pudo crear el proyecto";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const response = await apiRequest('PUT', `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/client/${clientId}`] });
      setShowEditProject(false);
      setShowManageLinks(false);
      setEditingProject(null);
      setSelectedProject(null);
      toast({
        title: "Proyecto actualizado",
        description: "Los cambios se han guardado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest('DELETE', `/api/projects/${projectId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/client/${clientId}`] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = (formData: FormData) => {
    const project = {
      clientId,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      status: formData.get('status') as string,
      deliveryDate: new Date().toISOString(),
    };
    createProjectMutation.mutate(project);
  };

  const handleUpdateProject = (formData: FormData) => {
    updateProjectMutation.mutate({
      id: editingProject.id,
      name: formData.get('name'),
      type: formData.get('type'),
      status: formData.get('status'),
    });
  };

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    const currentLinks = selectedProject.downloadLinks || [];
    const updatedLinks = [...currentLinks, { ...newLink, id: Date.now().toString() }];
    
    updateProjectMutation.mutate({
      id: selectedProject.id,
      downloadLinks: updatedLinks,
    });
    
    setNewLink({ title: '', url: '' });
  };

  const handleRemoveLink = (linkId: string) => {
    const currentLinks = selectedProject.downloadLinks || [];
    const updatedLinks = currentLinks.filter((link: any) => link.id !== linkId);
    
    updateProjectMutation.mutate({
      id: selectedProject.id,
      downloadLinks: updatedLinks,
    });
  };

  if (isLoading) {
    return <div className="animate-pulse">Cargando proyectos...</div>;
  }

  return (
    <Card className="glass-card fire-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="text-primary" />
            Proyectos de {clientName}
          </CardTitle>
          <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
            <DialogTrigger asChild>
              <Button className="fire-gradient text-white" size="sm">
                <Plus className="mr-1" size={16} />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card fire-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="fire-text">Crear Nuevo Proyecto</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateProject(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-name">Nombre del Proyecto</Label>
                    <Input
                      id="project-name"
                      name="name"
                      placeholder="Video Corporativo 2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-type">Tipo</Label>
                    <Select name="type" defaultValue="narrated">
                      <SelectTrigger id="project-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrated">Video Narrado</SelectItem>
                        <SelectItem value="sung">Video Cantado</SelectItem>
                        <SelectItem value="mixed">Mixto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="project-status">Estado</Label>
                  <Select name="status" defaultValue="pending">
                    <SelectTrigger id="project-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    🔗 Los enlaces de descarga se agregan después de crear el proyecto con el botón de cadena
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddProject(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 fire-gradient text-white">
                    Crear Proyecto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay proyectos para este cliente
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enlaces</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.type || 'Video'}</TableCell>
                  <TableCell>
                    <Badge className={
                      project.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      project.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }>
                      {project.status === 'completed' ? 'Completado' :
                       project.status === 'in_progress' ? 'En Progreso' :
                       'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {project.downloadLinks?.length || 0} enlaces
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedProject(project);
                          setShowManageLinks(true);
                        }}
                        data-testid={`button-manage-links-${project.id}`}
                        title="Agregar/Ver enlaces de descarga"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Link size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingProject(project);
                          setShowEditProject(true);
                        }}
                        data-testid={`button-edit-project-${project.id}`}
                        title="Editar proyecto"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('¿Está seguro de eliminar este proyecto?')) {
                            deleteProjectMutation.mutate(project.id);
                          }
                        }}
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Project Dialog */}
        <Dialog open={showEditProject} onOpenChange={setShowEditProject}>
          <DialogContent className="glass-card fire-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="fire-text">Editar Proyecto</DialogTitle>
            </DialogHeader>
            {editingProject && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateProject(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-project-name">Nombre del Proyecto</Label>
                    <Input
                      id="edit-project-name"
                      name="name"
                      defaultValue={editingProject.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-project-type">Tipo</Label>
                    <Select name="type" defaultValue={editingProject.type || 'narrated'}>
                      <SelectTrigger id="edit-project-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrated">Video Narrado</SelectItem>
                        <SelectItem value="sung">Video Cantado</SelectItem>
                        <SelectItem value="mixed">Mixto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-project-status">Estado</Label>
                  <Select name="status" defaultValue={editingProject.status}>
                    <SelectTrigger id="edit-project-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowEditProject(false);
                    setEditingProject(null);
                  }} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 fire-gradient text-white">
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Manage Download Links Dialog */}
        <Dialog open={showManageLinks} onOpenChange={setShowManageLinks}>
          <DialogContent className="glass-card fire-border max-w-3xl">
            <DialogHeader>
              <DialogTitle className="fire-text flex items-center gap-2">
                <Download className="text-primary" />
                Gestionar Enlaces de Descarga
              </DialogTitle>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Proyecto:</p>
                  <p className="font-semibold">{selectedProject.name}</p>
                </div>

                {/* Add new link form */}
                <div className="space-y-3 p-4 border border-border rounded-lg">
                  <h4 className="font-semibold">Agregar Nuevo Enlace</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="link-title">Título</Label>
                      <Input
                        id="link-title"
                        placeholder="Video Final HD"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-size">Tamaño (opcional)</Label>
                      <Input
                        id="link-size"
                        placeholder="250 MB"
                        value={newLink.size || ''}
                        onChange={(e) => setNewLink({ ...newLink, size: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="link-url">URL de Descarga</Label>
                    <Input
                      id="link-url"
                      placeholder="https://drive.google.com/file/..."
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddLink} className="fire-gradient text-white w-full">
                    <Plus className="mr-2" size={16} />
                    Agregar Enlace
                  </Button>
                </div>

                {/* Existing links */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Enlaces Existentes</h4>
                  {selectedProject.downloadLinks && selectedProject.downloadLinks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProject.downloadLinks.map((link: any) => (
                        <div key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileVideo className="text-primary" size={20} />
                            <div>
                              <p className="font-medium">{link.title}</p>
                              {link.size && (
                                <p className="text-sm text-muted-foreground">{link.size}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleRemoveLink(link.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No hay enlaces de descarga para este proyecto
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowManageLinks(false);
                    setSelectedProject(null);
                  }}
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}