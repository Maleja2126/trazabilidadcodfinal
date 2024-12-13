import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, toggleUserStatus, deleteUser } from "../services/authService";
import { FiHome, FiTrash2, FiUserCheck, FiUserX } from "react-icons/fi";
import { MdOutlineEdit } from "react-icons/md";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const roleNames = {
    user: "Enfermero/a",
    staff: "Médico/a",
    jefe: "Jefe de Enfermería",
};

const SearchUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
            } catch (error) {
                setError("Error al obtener los usuarios");
            }
        };
        fetchUsers();
    }, []);


    const handleToggleStatus = async (id, isActive) => {
        const userToToggle = users.find((user) => user.id === id);
        if (!userToToggle) return;
    
        const action = isActive ? "desactivar" : "activar";
        const result = await Swal.fire({
            title: `¿Estás seguro?`,
            text: `Estás a punto de ${action} al usuario "${userToToggle.username}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: "Cancelar",
        });
    
        if (result.isConfirmed) {
            try {
                await toggleUserStatus(id, !isActive);
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === id ? { ...user, is_active: !isActive } : user
                    )
                );
                toast.success(`Usuario "${userToToggle.username}" ${isActive ? "desactivado" : "activado"} correctamente.`);
            } catch (error) {
                setError("Error al actualizar el estado del usuario.");
                toast.error("Ocurrió un error al intentar cambiar el estado del usuario.");
            }
        }
    };
    
    const handleDeleteUser = async (id) => {
        const userToDelete = users.find((user) => user.id === id);
        if (!userToDelete) return;

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `Estás a punto de eliminar al usuario "${userToDelete.username}". Esta acción no se puede deshacer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await deleteUser(id);
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
                toast.success(`Usuario "${userToDelete.username}" eliminado correctamente.`);
            } catch (error) {
                toast.error("Error al eliminar el usuario.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-start h-screen bg-gray-100 p-6">
            <ToastContainer />
            <h1 className="text-4xl font-bold mb-3 mt-10 text-blue-800">Usuarios Registrados</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="w-full max-w-6xl overflow-x-auto mt-4">
                {/* Ajustamos el ancho del contenedor para que no ocupe toda la pantalla */}
                <div className="bg-white shadow-xl rounded-lg border border-gray-200">
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="min-w-full table-auto border-collapse table-fixed">
                            <thead className="bg-blue-600 text-white sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-center text-sm break-words">Nombre</th>
                                    <th className="p-3 text-center text-sm break-words">Cédula</th>
                                    <th className="p-3 text-center text-sm break-words">Correo</th>
                                    <th className="p-3 text-center text-sm break-words">Rol</th>
                                    <th className="p-3 text-center text-sm break-words">Estado</th>
                                    <th className="p-3 text-center text-sm break-words">Editar</th>
                                    <th className="p-3 text-center text-sm break-words">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="overflow-y-auto max-h-[400px]">
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-black-100 transition-all">
                                        <td className="p-4 text-center text-sm truncate">{user.username}</td>
                                        <td className="p-4 text-center text-sm truncate">{user.numero_identificacion}</td>
                                        <td className="p-4 text-center text-sm truncate">{user.email}</td>
                                        <td className="p-4 text-center text-sm truncate">{roleNames[user.role]}</td>
                                        <td className="p-4 text-center text-sm truncate">   
                                            {user.is_active ? "Activo" : "Inactivo"}
                                        </td>
                                        <td className="p-1 text-center text-sm">
                                            <span
                                                onClick={() => navigate(`/edit-user/${user.id}`)}
                                                className="cursor-pointer text-2xl hover:scale-110 transition-transform"
                                                title="Editar usuario"
                                            >
                                                &#9998;
                                            </span>
                                        </td>
                                        <td className="p-3 text-center flex justify-center space-x-1 text-sm">
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                className={`flex items-center p-3 text-white rounded text-xs ${user.is_active ? "bg-gray-500" : "bg-green-500"
                                                    } hover:bg-opacity-80 transition-all`}
                                            >
                                                {user.is_active ? (
                                                    <>
                                                        <FiUserX className="mr-1" /> Desactivar
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUserCheck className="mr-1" /> Activar
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="flex items-center p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-all"
                                            >
                                                <FiTrash2 className="mr-1" /> Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigate("/admin-panel")}
                className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
                <FiHome className="mr-2" /> Volver al Panel
            </button>
        </div>
    );
};

export default SearchUsers;