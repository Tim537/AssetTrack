const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Anmeldung fehlgeschlagen");
  }

  return response.json();
}

export async function getCurrentUser(token: string) {
    const response = await fetch(`${API_URL}/me`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Benutzer konnte nicht abgerufen werden");
    }
    return response.json();
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Registrierung fehlgeschlagen");
  }

  return response.json();
}

export async function fetchWithAuth(endpoint: string, token: string) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return response.json();
}

export async function createOrganization(name: string, token: string) {
    const response = await fetch(`${API_URL}/organization/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Organisation konnte nicht erstellt werden");
    }
    return response.json();
}

export async function joinOrganization(joinCode: string, token: string) {
    const response = await fetch(`${API_URL}/organization/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ join_code: joinCode })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Beitritt zur Organisation fehlgeschlagen");
    }
    return response.json();
}

export async function getOrganization(token: string) {
    const response = await fetch(`${API_URL}/organization`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Organisation konnte nicht abgerufen werden");
    }
    return response.json();
}

export async function getAllOrganizations(token: string) {
    const response = await fetch(`${API_URL}/organization/all`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Organisationen konnten nicht abgerufen werden");
    }
    return response.json();
}

export async function getOrganizationById(orgId: number, token: string) {
    const response = await fetch(`${API_URL}/organization/${orgId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Organisation konnte nicht abgerufen werden");
    }
    return response.json();
}

export async function kickMember(memberId: number, token: string) {
    const response = await fetch(`${API_URL}/organization/members/${memberId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Mitglied konnte nicht entfernt werden");
    }
    return response.json();
}

export async function leaveOrganization(token: string, orgId?: number) {
    const url = orgId 
        ? `${API_URL}/organization/${orgId}/leave`
        : `${API_URL}/organization/leave`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Organisation konnte nicht verlassen werden");
    }
    return response.json();
}

export async function kickMemberFromOrg(orgId: number, memberId: number, token: string) {
    const response = await fetch(`${API_URL}/organization/${orgId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Mitglied konnte nicht entfernt werden");
    }
    return response.json();
}

export async function getAssets(orgId: number, token: string, filters?: { lifecycle?: string; type?: string }) {
    const queryParams = new URLSearchParams();
    if (filters?.lifecycle && filters.lifecycle !== "ALL") queryParams.append("lifecycle", filters.lifecycle);
    if (filters?.type && filters.type !== "ALL") queryParams.append("type", filters.type);

    const response = await fetch(`${API_URL}/organization/${orgId}/assets?${queryParams.toString()}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Assets konnten nicht abgerufen werden");
    }
    return response.json();
}

export async function createAsset(orgId: number, assetData: any, token: string) {
    const response = await fetch(`${API_URL}/organization/${orgId}/assets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(assetData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Asset konnte nicht erstellt werden");
    }
    return response.json();
}

export async function updateAsset(assetId: number, assetData: any, token: string) {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(assetData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Asset konnte nicht aktualisiert werden");
    }
    return response.json();
}

export async function deleteAsset(assetId: number, token: string) {
    const response = await fetch(`${API_URL}/assets/${assetId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Asset konnte nicht gelöscht werden");
    }
    return response.json();
}

export async function uploadAssetFile(assetId: number, file: File, token: string) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/assets/${assetId}/attachment`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        let errorMessage = "Datei konnte nicht hochgeladen werden";
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {
            errorMessage = `Upload fehlgeschlagen mit Status ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    return response.json();
}

export async function getAssetHistory(assetId: number, token: string) {
    const response = await fetch(`${API_URL}/assets/${assetId}/history`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Asset-Verlauf konnte nicht abgerufen werden");
    }
    return response.json();
}

export async function getAssetAttachments(assetId: number, token: string) {
    const response = await fetch(`${API_URL}/assets/${assetId}/attachments`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Anhänge konnten nicht abgerufen werden");
    }
    return response.json();
}

export async function deleteAssetAttachment(attachmentId: number, token: string) {
    const response = await fetch(`${API_URL}/assets/attachments/${attachmentId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Anhang konnte nicht gelöscht werden");
    }
    return response.json();
}

export function getDownloadAttachmentUrl(attachmentId: number, token: string) {
    return `${API_URL}/assets/attachments/${attachmentId}/download?token=${token}`;
}
