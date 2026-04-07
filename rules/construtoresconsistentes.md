Construtores consistentes em todos os módulos
Se a base é RequestClient, todos os módulos filhos devem:
herdar de RequestClient
chamar super().init(token_auth)
Isso evita variações e bugs de inicialização.