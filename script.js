// Função para mapear meses para números
const monthMap = {
    Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
    Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12
  };
  
// Função principal
d3.csv("homicidios.csv").then(data => {
  // 1️⃣ Limpeza e conversão de dados

  console.log("Dados carregados:", data); // Verifique se os dados aparecem

  if (data.length === 0) {
      console.error("Arquivo CSV não foi carregado ou está vazio.");
      return; // Impede execução do restante se não houver dados
  }

  const cleanedData = data
  .filter(d => +d.Ano !== 2021) // Filtra fora os dados do ano de 2021
  .map(d => ({
    mes: d.Mes,
    mes_numero: monthMap[d.Mes],
    ano: +d.Ano,
    total_crimes: +d["Total Crimes"],
    date: new Date(+d.Ano, monthMap[d.Mes] - 1) // Cria data real para o eixo x
  }));

  // 2️⃣ Agrupamento e soma por Mês/Ano
  const crimesPorMesAno = d3.rollup(
    cleanedData,
    v => d3.sum(v, d => d.total_crimes) / 20,
    d => d.mes
  );

  // 3️⃣ Transformação para um array plano com data e total_crimes
  const dadosParaGrafico = [];
  crimesPorMesAno.forEach((total_crimes, mes) => {
    dadosParaGrafico.push({
      mes,
      total_crimes,
      date: new Date(2000, monthMap[mes] - 1) // Escolha um ano de referência para plotar
    });
  });

  // Ordena os dados por data
  dadosParaGrafico.sort((a, b) => a.date - b.date);

  // Seleciona o contêiner onde o gráfico será renderizado
  const container = d3.select("#chart");
  const containerWidth = container.node().clientWidth;
  const containerHeight = container.node().clientHeight;

  // Margens e dimensões internas do gráfico
  const margin = { top: 80, right: 40, bottom: 80, left: 80 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  // Cria o SVG com viewBox para responsividade
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(dadosParaGrafico, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([310, 380])
    .range([height, 0]);

  // Meses para os ticks do eixo x
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Eixos
  svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x)
    .ticks(12)
    .tickFormat(d => monthNames[d.getMonth()])
  )
  .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
  .call(d3.axisLeft(y)); // Eixo y com range definido


  svg.append("g")
    .call(d3.axisLeft(y));

  // 7️⃣ Linha do gráfico
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.total_crimes))

  svg.append("path")
    .datum(dadosParaGrafico)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);


  // 9️⃣ Legenda dos eixos
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .text("Mês");

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Média de Homicídios");

  svg.append("rect")  
    .attr("x", 485)     
    .attr("y", 0)     
    .attr("width", 180) 
    .attr("height", 240) 
    .attr("fill", "steelblue")
    .attr("opacity", 0.4);
  
  svg.append("text")
    .attr("x", 575)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .text("Menos casos");

  svg.append("text")
    .attr("x", 575)
    .attr("y", 70)
    .attr("text-anchor", "middle")
    .text("no inverno");

    // Adiciona o título
  svg.append("text")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "24px")
  .style("font-weight", "bold")
  .text("O Período de Inverno é o mais Seguro para Visitar São Paulo?");

  // Adiciona o subtítulo
  svg.append("text")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2 + 25)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Média dos homicídios por mês do estado de São Paulo(2001-2020)");
});
