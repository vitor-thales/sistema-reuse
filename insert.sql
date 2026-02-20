USE dbReuse;

-- ----------------------------------------------------------
-- 1. POPULATE tbEmpresas 
-- ----------------------------------------------------------
INSERT INTO tbEmpresas (
    ikPublica, ikPrivada, salt, iv, cnpj, razaoSocial, nomeFantasia, 
    emailCorporativo, foneCorporativo, nomeResponsavel, cpfResponsavel, 
    senhaHash, cepEmpresa, estado, cidade, bairro, endereco, numEndereco, 
    compEndereco, docComprovanteEndereco, docCartaoCNPJ, docContratoSocial, 
    descricao, dataCadastro, cadastroAtivo, dataAprovacao
) VALUES 
('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', 'eVwU+1jW+ioJHP+vawEHGQ==', 'QNHYG0fFam8dHB4u', '06990590000557', 'GOOGLE BRASIL INTERNET LTDA.', 'Google', 'vitor.rohling.becker@gmail.com', '45998041305', 'Vitor Valentin', '34293729097', '$2b$10$3OX/cvYXk3EwdDGdZrBWxeZqQen870HQjYiJ2/hk0DCEFRnABkfW2', '85819020', 'Paraná', 'Cascavel', 'Universitário', 'Rua Pedro Bau', '104', 'Teste2', '2139afcfd72fc201.jpg', '3b256353ed5c5d2e.jpg', NULL, '', '2026-02-19 20:46:40', 1, '2026-02-19 20:52:30'),
('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', 'lhzgKSNZj6wAYMREPXrx2A==', 'Q+qQoGEKCyVGr7r4', '04712500000107', 'Microsoft do Brasil Importacao e Comercio de Software e Video Games LTDA', 'Microsoft', 'thales@belle.com', '45111111111', 'Thales Bellé', '29451865004', '$2b$10$jOHQYHX7yBkr/7jUdyRvDO3vJhBZTDSY6tdpP0zVhQwhNyLkXjxJe', '85819020', 'Paraná', 'Cascavel', 'Universitário', 'Rua Pedro Bau', '110', '', 'ff3eccdeef9fd03d.jpg', '13448f488ba256cb.jpg', NULL, '', '2026-02-19 20:50:08', 1, '2026-02-19 20:52:05'),
('PUB_KEY_003', 'PRIV_KEY_003', 'SALT_003', 'IV_003', '12345678000190', 'TECH SOLUTIONS LTDA', 'TechSol', 'contact@techsol.com', '11988887777', 'Ana Silva', '12345678901', 'HASH_003', '01001000', 'São Paulo', 'São Paulo', 'Sé', 'Praça da Sé', '10', 'Sala 101', 'comp_003.jpg', 'cnpj_003.jpg', 'social_003.jpg', 'Software Dev', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
('PUB_KEY_004', 'PRIV_KEY_004', 'SALT_004', 'IV_004', '98765432000100', 'GREEN ENERGY S.A.', 'GreenE', 'info@greenenergy.com', '21977776666', 'Carlos Souza', '98765432100', 'HASH_004', '20040000', 'Rio de Janeiro', 'Rio de Janeiro', 'Centro', 'Av Rio Branco', '500', '', 'comp_004.jpg', 'cnpj_004.jpg', NULL, 'Renewable Energy', DATE_SUB(NOW(), INTERVAL 1 MONTH), 1, DATE_SUB(NOW(), INTERVAL 28 DAY)),
('PUB_KEY_005', 'PRIV_KEY_005', 'SALT_005', 'IV_005', '11223344000155', 'BLUE LOGISTICS TRANSPORTES', 'BlueLog', 'ops@bluelog.com', '31966665555', 'Maria Oliveira', '11122233344', 'HASH_005', '30110000', 'Minas Gerais', 'Belo Horizonte', 'Savassi', 'Rua Pernambuco', '123', 'Bloco B', 'comp_005.jpg', 'cnpj_005.jpg', 'social_005.jpg', 'Logistics Services', DATE_SUB(NOW(), INTERVAL 7 DAY), 0, NULL),
('PUB_KEY_006', 'PRIV_KEY_006', 'SALT_006', 'IV_006', '55667788000122', 'ALPHA CONSULTORIA EMPRESARIAL', 'AlphaConsult', 'hr@alphaconsult.com', '41955554444', 'Roberto Santos', '55566677788', 'HASH_006', '80010010', 'Paraná', 'Curitiba', 'Batel', 'Av Sete de Setembro', '2000', 'Andar 5', 'comp_006.jpg', 'cnpj_006.jpg', NULL, 'Business Strategy', DATE_SUB(NOW(), INTERVAL 2 MONTH), 1, DATE_SUB(NOW(), INTERVAL 55 DAY)),
('PUB_KEY_007', 'PRIV_KEY_007', 'SALT_007', 'IV_007', '99001122000133', 'HEALTH CARE PLUS SERVICOS MEDICOS', 'HealthPlus', 'admin@healthplus.com', '51944443333', 'Lucia Mendes', '99900011122', 'HASH_007', '90010000', 'Rio Grande do Sul', 'Porto Alegre', 'Moinhos de Vento', 'Rua Padre Chagas', '45', '', 'comp_007.jpg', 'cnpj_007.jpg', 'social_007.jpg', 'Medical Services', DATE_SUB(NOW(), INTERVAL 3 DAY), 0, NULL),
('PUB_KEY_008', 'PRIV_KEY_008', 'SALT_008', 'IV_008', '33445566000144', 'SUNRISE FOODS DISTRIBUIDORA', 'Sunrise', 'sales@sunrise.com', '61933332222', 'Fernando Lima', '33344455566', 'HASH_008', '70040000', 'Distrito Federal', 'Brasília', 'Asa Sul', 'CLS 405', 'S/N', 'Loja 12', 'comp_008.jpg', 'cnpj_008.jpg', NULL, 'Food Distribution', DATE_SUB(NOW(), INTERVAL 14 DAY), 1, DATE_SUB(NOW(), INTERVAL 12 DAY)),
('PUB_KEY_009', 'PRIV_KEY_009', 'SALT_009', 'IV_009', '77889900000111', 'URBAN ARCHITECTS ESTUDIO', 'UrbanArch', 'design@urbanarch.com', '71922221111', 'Juliana Costa', '77788899900', 'HASH_009', '40015000', 'Bahia', 'Salvador', 'Barra', 'Av Oceanica', '99', 'Sala 2', 'comp_009.jpg', 'cnpj_009.jpg', 'social_009.jpg', 'Architecture and Design', DATE_SUB(NOW(), INTERVAL 45 DAY), 1, DATE_SUB(NOW(), INTERVAL 40 DAY)),
('PUB_KEY_010', 'PRIV_KEY_010', 'SALT_010', 'IV_010', '44556677000188', 'PEAK PERFORMANCE ACADEMIA LTDA', 'PeakGym', 'manager@peakgym.com', '81911110000', 'Marcos Rocha', '44455566677', 'HASH_010', '50010000', 'Pernambuco', 'Recife', 'Boa Viagem', 'Av Boa Viagem', '1500', '', 'comp_010.jpg', 'cnpj_010.jpg', NULL, 'Fitness Center', DATE_SUB(NOW(), INTERVAL 5 DAY), 0, NULL);
('PK_011', 'SK_011', 'S_011', 'IV_011', '55111222000199', 'COFFEE BREAK EXPRESS', 'CoffeeEx', 'admin@coffee.br', '1133221100', 'Pedro Ramos', '45678912300', 'HASH_11', '04543011', 'São Paulo', 'São Paulo', 'Itaim Bibi', 'Rua Tabapuã', '450', 'Andar 2', 'c11.jpg', 'j11.jpg', 's11.jpg', 'Coffee Shop', DATE_SUB(NOW(), INTERVAL 10 DAY), 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
('PK_012', 'SK_012', 'S_012', 'IV_012', '66222333000188', 'OCEAN BLUE SURF SHOP', 'OceanSurf', 'surf@ocean.com', '4899112233', 'Gabriel Mares', '78912345611', 'HASH_12', '88010000', 'Santa Catarina', 'Florianópolis', 'Centro', 'Rua das Palmeiras', '12', '', 'c12.jpg', 'j12.jpg', NULL, 'Surf Gear', DATE_SUB(NOW(), INTERVAL 3 MONTH), 1, DATE_SUB(NOW(), INTERVAL 85 DAY)),
('PK_013', 'SK_013', 'S_013', 'IV_013', '77333444000177', 'METALURGICA FERRO FORTE', 'FerroForte', 'vendas@ferro.br', '5432215566', 'Ricardo Aço', '15926348700', 'HASH_13', '95010000', 'Rio Grande do Sul', 'Caxias do Sul', 'Lourdes', 'Rua Sinimbu', '990', 'Galpão', 'c13.jpg', 'j13.jpg', 's13.jpg', 'Metallurgy', DATE_SUB(NOW(), INTERVAL 60 DAY), 0, NULL),
('PK_014', 'SK_014', 'S_014', 'IV_014', '88444555000166', 'PET SHOP FELIZ LTDA', 'PetFeliz', 'pet@feliz.com', '1932556677', 'Carla Dias', '32165498711', 'HASH_14', '13010000', 'São Paulo', 'Campinas', 'Cambuí', 'Av Julio de Mesquita', '200', 'Loja B', 'c14.jpg', 'j14.jpg', NULL, 'Pet Services', DATE_SUB(NOW(), INTERVAL 4 DAY), 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('PK_015', 'SK_015', 'S_015', 'IV_015', '99555666000155', 'LIVRARIA PAGINA UM', 'PaginaUm', 'contato@pagina1.com', '2125443322', 'Sonia Veras', '98732165422', 'HASH_15', '20010000', 'Rio de Janeiro', 'Rio de Janeiro', 'Centro', 'Rua do Ouvidor', '55', '', 'c15.jpg', 'j15.jpg', 's15.jpg', 'Bookstore', DATE_SUB(NOW(), INTERVAL 15 DAY), 0, NULL),
('PK_016', 'SK_016', 'S_016', 'IV_016', '10111222000144', 'AUTO PECAS RAPIDO', 'AutoRapido', 'pecas@rapido.br', '3133445566', 'Jose Motor', '74185296300', 'HASH_16', '31010000', 'Minas Gerais', 'Belo Horizonte', 'Prado', 'Rua Platina', '80', '', 'c16.jpg', 'j16.jpg', NULL, 'Car Parts', DATE_SUB(NOW(), INTERVAL 22 DAY), 1, DATE_SUB(NOW(), INTERVAL 20 DAY)),
('PK_017', 'SK_017', 'S_017', 'IV_017', '11122233000133', 'FARMACIA SAUDE TOTAL', 'SaudeTotal', 'sac@saude.com', '6233112244', 'Beatriz Remédio', '36925814755', 'HASH_17', '74010000', 'Goiás', 'Goiânia', 'Setor Oeste', 'Av Republica', '1001', 'Térreo', 'c17.jpg', 'j17.jpg', 's17.jpg', 'Pharmacy', DATE_SUB(NOW(), INTERVAL 8 DAY), 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
('PK_018', 'SK_018', 'S_018', 'IV_018', '22233344000122', 'MERCADO DO POVO', 'MercPov', 'contato@povomerc.br', '8134556677', 'Wilson Silva', '15975345688', 'HASH_18', '50010100', 'Pernambuco', 'Recife', 'Santo Amaro', 'Av Cruz Cabugá', '300', '', 'c18.jpg', 'j18.jpg', NULL, 'Grocery', DATE_SUB(NOW(), INTERVAL 12 MONTH), 1, DATE_SUB(NOW(), INTERVAL 360 DAY)),
('PK_019', 'SK_019', 'S_019', 'IV_019', '33344455000111', 'RESTAURANTE SABOR LOCAL', 'SaborLoc', 'chefe@sabor.com.br', '7133449900', 'Leticia Tempero', '85296374133', 'HASH_19', '40000000', 'Bahia', 'Salvador', 'Pelourinho', 'Rua Direita', '5', '', 'c19.jpg', 'j19.jpg', 's19.jpg', 'Restaurant', DATE_SUB(NOW(), INTERVAL 2 DAY), 0, NULL),
('PK_020', 'SK_020', 'S_020', 'IV_020', '44455566000100', 'MODA TREND BRASIL', 'ModaTrend', 'style@trend.com', '1144556677', 'Alice Estilo', '96385274144', 'HASH_20', '01153000', 'São Paulo', 'São Paulo', 'Bom Retiro', 'Rua José Paulino', '88', 'Loja 4', 'c20.jpg', 'j20.jpg', NULL, 'Clothing Store', DATE_SUB(NOW(), INTERVAL 35 DAY), 1, DATE_SUB(NOW(), INTERVAL 30 DAY));

UPDATE tbConfigEmpresas SET segAutDuasEtapas = 1 WHERE idEmpresa = 1;
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
INSERT INTO tbAnuncios (idEmpresa, nomeProduto, valorTotal, quantidade, unidadeMedida, pesoTotal, descricao, idCategoria, condicao, origem, composicao, modalidadeColeta, status) VALUES 
(1, 'Lote de Servidores Rack', 15000.00, 10, 'Unidades', 250, 'Servidores desativados para reciclagem de componentes.', 2, 'Usado - Não Funcional', 'Data Center', 'Metal, Silício, Plásticos', 'Entrega Direta em Endereço', 'ativo'),
(1, 'Cabos de Rede Cat6e Usados', 450.00, 50, 'Metros', 15, 'Sobras de manutenção de infraestrutura.', 4, 'Usado - Funcional', 'Escritório', 'Cobre, PVC', 'Disponível para Agendamento', 'ativo'),
(2, 'Monitores LED 24 pol', 5000.00, 20, 'Unidades', 80, 'Monitores com dead pixels ou avarias estéticas.', 5, 'Usado - Não Funcional', 'Escritório SP', 'Vidro, Plástico, Circuitos', 'Entrega Direta em Endereço', 'ativo'),
(2, 'Baterias de Notebook Surface', 1200.00, 30, 'Unidades', 12, 'Baterias inchadas ou com baixa autonomia para descarte químico.', 3, 'Usado - Não Funcional', 'SAC Brasil', 'Lítio', 'Disponível para Agendamento', 'ativo'),
(3, 'Placas-mãe de Notebooks', 2500.00, 45, 'Unidades', 10, 'Placas diversas para extração de metais preciosos.', 1, 'Usado - Não Funcional', 'Manutenção', 'Metais, Cerâmica', 'Disponível para Agendamento', 'ativo'),
(3, 'Lote de Teclados Mecânicos', 800.00, 15, 'Unidades', 12, 'Teclados com defeito em switch.', 2, 'Usado - Não Funcional', 'Logística Reversa', 'Plástico ABS, Metal', 'Entrega Direta em Endereço', 'ativo'),
(3, 'Fontes de Alimentação ATX', 600.00, 10, 'Unidades', 15, 'Fontes 500W testadas e funcionando.', 4, 'Usado - Funcional', 'Upgrade de Máquinas', 'Cobre, Alumínio', 'Disponível para Agendamento', 'ativo'),
(3, 'Tablets Educativos', 3000.00, 20, 'Unidades', 8, 'Telas quebradas, touch não funciona.', 2, 'Usado - Não Funcional', 'Doação governamental', 'Vidro, Lítio', 'Entrega Direta em Endereço', 'ativo'),
(3, 'Fios de Cobre Descapados', 200.00, 5, 'Quilos', 5, 'Cobre limpo para reciclagem direta.', 4, 'Usado - Não Funcional', 'Instalação Elétrica', 'Cobre', 'Disponível para Agendamento', 'ativo'),
(4, 'Baterias Estacionárias 100Ah', 4500.00, 5, 'Unidades', 150, 'Baterias de no-break solar para reciclagem.', 3, 'Usado - Não Funcional', 'Sistema Solar', 'Chumbo-Ácido', 'Entrega Direta em Endereço', 'ativo'),
(4, 'Painéis Solares Avariados', 1500.00, 4, 'Unidades', 72, 'Vidro trincado, mas células gerando baixa tensão.', 1, 'Usado - Não Funcional', 'Parque Solar', 'Silício, Alumínio', 'Disponível para Agendamento', 'ativo'),
(4, 'Controladores de Carga MPPT', 850.00, 3, 'Unidades', 6, 'Equipamentos com erro de firmware.', 1, 'Usado - Não Funcional', 'Manutenção Campo', 'Placas de Circuito', 'Entrega Direta em Endereço', 'ativo'),
(4, 'Carcaças de Inversores', 300.00, 10, 'Unidades', 40, 'Alumínio de alta qualidade.', 4, 'Usado - Não Funcional', 'Sucata', 'Alumínio', 'Disponível para Agendamento', 'ativo'),
(4, 'Cabo Flexível 16mm', 1100.00, 100, 'Metros', 25, 'Sobras de obra de usina fotovoltaica.', 4, 'Novo', 'Obra Finalizada', 'Cobre', 'Entrega Direta em Endereço', 'ativo');

-- ----------------------------------------------------------
-- 4. POPULATE tbImagensAnuncios 
-- ----------------------------------------------------------
INSERT INTO tbImagensAnuncios (idAnuncio, nomeArquivo) VALUES 
(1, 'placeholder.jpg'), (1, 'placeholder.jpg'),
(2, 'placeholder.jpg'),
(3, 'placeholder.jpg'), (3, 'placeholder.jpg'),
(4, 'placeholder.jpg'),
(5, 'placeholder.jpg'),
(6, 'placeholder.jpg'),
(10, 'placeholder.jpg'),
(11, 'placeholder.jpg');

-- ----------------------------------------------------------
-- 5. POPULATE tbVisualizacoesAnuncios
-- ----------------------------------------------------------
INSERT INTO tbVisualizacoesAnuncios (idAnuncio, idEmpresa) VALUES 
(1, 2), (1, 3), (1, 4), 
(3, 1), (3, 5),          
(5, 6), (5, 7), (5, 8),
(10, 3), (11, 3);        

-- ----------------------------------------------------------
-- 6. POPULATE Conversations 
-- ----------------------------------------------------------
INSERT INTO tbConversas (idEmpresa1, idEmpresa2) VALUES 
(3, 4), 
(3, 5),
(4, 6), 
(7, 8), 
(9, 10); 
INSERT INTO tbMensagens (idConversa, idRemetente, idDestinatario, content, iv, sig, dataEnvio, entregue, lida) VALUES 
(1, 3, 4, 'Encrypted_Content_A1...', 'iv_vector_001==', 'signature_001==', DATE_SUB(NOW(), INTERVAL 2 HOUR), 1, 1),
(1, 4, 3, 'Encrypted_Content_A2...', 'iv_vector_002==', 'signature_002==', DATE_SUB(NOW(), INTERVAL 1 HOUR), 1, 1),
(1, 3, 4, 'Encrypted_Content_A3...', 'iv_vector_003==', 'signature_003==', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 1, 0),
(2, 5, 3, 'Encrypted_Logistics_Data...', 'iv_vector_004==', 'signature_004==', DATE_SUB(NOW(), INTERVAL 1 DAY), 1, 1),
(3, 6, 4, 'Encrypted_Proposal_X...', 'iv_vector_005==', 'signature_005==', DATE_SUB(NOW(), INTERVAL 5 HOUR), 1, 1),
(4, 7, 8, 'Encrypted_Health_Report...', 'iv_vector_006==', 'signature_006==', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 1, 0),
(5, 10, 9, 'Encrypted_Gym_Layout...', 'iv_vector_007==', 'signature_007==', DATE_SUB(NOW(), INTERVAL 3 DAY), 1, 1);
INSERT INTO tbMensagensKeys (idMensagem, idEmpresa, wrappedKey) VALUES 
(1, 3, 'WrappedKey_For_TechSol_Msg1=='),
(1, 4, 'WrappedKey_For_GreenEnergy_Msg1=='),
(2, 3, 'WrappedKey_For_TechSol_Msg2=='),
(2, 4, 'WrappedKey_For_GreenEnergy_Msg2=='),
(3, 3, 'WrappedKey_For_TechSol_Msg3=='),
(3, 4, 'WrappedKey_For_GreenEnergy_Msg3=='),
(4, 3, 'WrappedKey_For_TechSol_Msg4=='),
(4, 5, 'WrappedKey_For_BlueLog_Msg4=='),
(5, 4, 'WrappedKey_For_GreenEnergy_Msg5=='),
(5, 6, 'WrappedKey_For_AlphaConsult_Msg5==');

-- ----------------------------------------------------------
-- 7. POPULATE tbUsuariosSistema (Admin Users)
-- ----------------------------------------------------------
INSERT INTO tbUsuariosSistema (nome, email, cargo, status, pAdmin, pGerenciarCategorias, pGerenciarPedidos, senhaHash) VALUES 
('Administrador Geral', 'admin@reuse.com.br', 'Gerente', 1, 1, 1, 1, '$2a$10$Kpj8GjztIxgNKd/ILFeUJ.4.EdUofSF/yAAD2OxwXl7Hn5kwD1Jre');

-- ----------------------------------------------------------
-- 7. UPDATE tbTempoRespostaEmpresas (Run your procedure)
-- ----------------------------------------------------------
CALL calcTempoRespostaPerfil();