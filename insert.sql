USE dbReuse;

-- ----------------------------------------------------------
-- 1. POPULATE tbEmpresas (Real Keys provided)
-- ----------------------------------------------------------
INSERT INTO tbEmpresas (
    ikPublica, ikPrivada, salt, iv, cnpj, razaoSocial, nomeFantasia, 
    emailCorporativo, foneCorporativo, nomeResponsavel, cpfResponsavel, senhaHash, 
    cepEmpresa, estado, cidade, bairro, endereco, numEndereco, compEndereco, 
    docComprovanteEndereco, docCartaoCNPJ, docContratoSocial, dataCadastro, cadastroAtivo
) VALUES 
(
    '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', 
    'WJMmC6KHczFV+cAxBwuFuQ==', 
    '/EJt1Ee0UWdy6B7f', 
    '06990590000557', 
    'Google Com Ltda', 
    NULL, 
    'vitor.rohling.becker@gmail.com', 
    '45998041305', 
    'Vitor', 
    '10295007974', 
    '$2a$10$Kpj8GjztIxgNKd/ILFeUJ.4.EdUofSF/yAAD2OxwXl7Hn5kwD1Jre', 
    '85819020', 'Paraná', 'Cascavel', 'Universitário', 'Rua Pedro Bau', '361', 'Teste', 
    '8d535761051e8a8d.jpg', 'ec1b7e0134a556de.jpg', NULL, '2026-02-17 20:10:18', 1
),
( 
    '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', 
    'OwykX+cfH47rGLKSwTjMQw==', 
    'Boi5OZV+VmHyFl31', 
    '58289793000190', 
    'Roblox LTDA', 
    'Roblox', 
    'roblox@nemsei.com', 
    '45999999999', 
    'Roblox Dono', 
    '05561856090', 
    '$2a$10$Kpj8GjztIxgNKd/ILFeUJ.4.EdUofSF/yAAD2OxwXl7Hn5kwD1Jre', 
    '85819020', 'Paraná', 'Cascavel', 'Universitário', 'Rua Pedro Bau', '111', '', 
    'f632f27ec0e17ae5.jpg', '070a0c70d5faaa0e.jpg', NULL, '2026-02-17 20:18:16', 1
);

-- Note: tbConfigEmpresas is automatically populated by your TRIGGER tgCreateConfigEmpresa

-- ----------------------------------------------------------
-- 2. POPULATE tbCategorias
-- ----------------------------------------------------------
INSERT INTO tbCategorias (nome, descricao) VALUES 
('Placas de Circuito', 'Placas-mãe, placas de vídeo e circuitos variados.'),
('Computadores', 'Desktops e notebooks completos ou para retirada de peças.'),
('Baterias', 'Baterias de lítio, chumbo-ácido e pilhas recarregáveis.'),
('Cabos e Fios', 'Cabos de cobre, fontes de alimentação e conexões diversas.'),
('Monitores', 'Telas LCD, LED e CRT para reciclagem ou conserto.');

-- ----------------------------------------------------------
-- 3. POPULATE tbAnuncios
-- ----------------------------------------------------------
INSERT INTO tbAnuncios (idEmpresa, nomeProduto, valorTotal, quantidade, unidadeMedida, pesoTotal, descricao, idCategoria, condicao, origem, composicao, modalidadeColeta, status, dataStatus) VALUES 
(1, 'Lote de Placas-mãe Antigas', 500.00, 10, 'Unidades', 15, 'Lote com 10 placas-mãe de servidores antigos para extração de metais.', 1, 'Usado - Não Funcional', 'Descarte Corporativo', 'Cobre, Ouro, Fibra', 'Disponível para Agendamento', 'ativo', NOW()),
(1, 'Notebooks Dell para Peças', 1200.00, 3, 'Unidades', 8, '3 notebooks Latitude sem HD. Ligam mas telas estão quebradas.', 2, 'Usado - Não Funcional', 'Leilão', 'Plástico, Alumínio, Lítio', 'Entrega Direta em Endereço', 'ativo', NOW()),
(2, 'Baterias Estacionárias 12v', 450.00, 5, 'Unidades', 40, 'Baterias de UPS/No-break usadas. Ideais para reciclagem de chumbo.', 3, 'Usado - Funcional', 'Troca de Infraestrutura', 'Chumbo, Ácido', 'Disponível para Agendamento', 'ativo', NOW()),
(2, 'Fios de Cobre Encapados', 200.00, 50, 'Metros', 20, 'Sobras de instalação elétrica industrial.', 4, 'Novo', 'Sobra de obra', 'Cobre, PVC', 'Entrega Direta em Endereço', 'vendido', DATE_SUB(NOW(), INTERVAL 1 MONTH));

-- ----------------------------------------------------------
-- 4. POPULATE tbImagensAnuncios (Linking to the IDs above)
-- ----------------------------------------------------------
INSERT INTO tbImagensAnuncios (idAnuncio, nomeArquivo) VALUES 
(1, 'placas_servidor.jpg'),
(2, 'notebook_dell.jpg'),
(3, 'bateria_chumbo.jpg'),
(4, 'fios_cobre.jpg');

-- ----------------------------------------------------------
-- 5. POPULATE tbVisualizacoesAnuncios (To feed your dashboard views)
-- ----------------------------------------------------------
INSERT INTO tbVisualizacoesAnuncios (idAnuncio, idEmpresa, dataVisualizacao) VALUES 
(1, 2, NOW()),
(1, 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, NOW());

-- ----------------------------------------------------------
-- 6. POPULATE tbUsuariosSistema (Admin Users)
-- ----------------------------------------------------------
INSERT INTO tbUsuariosSistema (nome, email, cargo, status, pAdmin, pGerenciarCategorias, pGerenciarPedidos, senhaHash) VALUES 
('Administrador Geral', 'admin@reuse.com.br', 'Gerente', 1, 1, 1, 1, '$2a$10$Kpj8GjztIxgNKd/ILFeUJ.4.EdUofSF/yAAD2OxwXl7Hn5kwD1Jre');

-- ----------------------------------------------------------
-- 7. UPDATE tbTempoRespostaEmpresas (Run your procedure)
-- ----------------------------------------------------------
CALL calcTempoRespostaPerfil();