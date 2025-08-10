# Script de sincronizacao GitHub-Replit (Windows PowerShell)
# Uso: .\sync.ps1 ["mensagem do commit"]

param(
    [string]$CommitMessage = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "Iniciando sincronizacao GitHub-Replit" -ForegroundColor Blue

# Verificar se estamos num repositório Git
if (!(Test-Path ".git")) {
    Write-Host "Erro: Nao encontrado repositorio Git nesta pasta" -ForegroundColor Red
    exit 1
}

# Verificar se há alterações
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nenhuma alteracao detectada para commit" -ForegroundColor Yellow
} else {
    Write-Host "Alteracoes detectadas..." -ForegroundColor Green
    
    # Mostrar status
    git status --short
    
    # Adicionar todos os ficheiros
    Write-Host "Adicionando ficheiros..." -ForegroundColor Blue
    git add .
    
    # Commit
    Write-Host "Fazendo commit: $CommitMessage" -ForegroundColor Blue
    git commit -m $CommitMessage
}

# Push para GitHub
Write-Host "Enviando para GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "Sincronizacao completa!" -ForegroundColor Green
Write-Host "No Replit, vai ao Git e faz Pull para obter as alteracoes" -ForegroundColor Yellow
