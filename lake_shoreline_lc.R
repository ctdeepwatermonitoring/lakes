#Lakes 2016 1 M res land cover data - 90 M Lake Shoreline
lb16 <- read.csv('lake_shoreline/data/lakes_111823_lc_2016_buffer.csv', 
                  header = TRUE)

lb16$cnt      <- rowSums(lb16[,c(10:22)], na.rm = TRUE)
lb16$pct_dev  <- ((lb16$HISTO_2 + lb16$HISTO_5) / lb16$cnt) * 100
lb16$pct_ag   <- ((lb16$HISTO_6 + lb16$HISTO_7 + lb16$HISTO_8) / lb16$cnt) * 100
lb16$pct_for  <- ((lb16$HISTO_11 + lb16$HISTO_12) / lb16$cnt) * 100
lb16$pct_wet  <- ((lb16$HISTO_13 + lb16$HISTO_14 + lb16$HISTO_15) / lb16$cnt) * 100
lb16$pct_bar  <- ((lb16$HISTO_19 + lb16$HISTO_20) / lb16$cnt) * 100
lb16$pct_ots  <- (ifelse(lb16$cnt == 0, 0, 
                 (1 - (rowSums(lb16[,c(11:22)]/lb16$cnt, na.rm = TRUE))))) *100

lb <- reshape(lb16[,c(1,26:31)], 
              varying = c('pct_dev','pct_ag','pct_for','pct_wet','pct_bar'),
              idvar = 'ComID',
              v.names = 'pct', 
              timevar = 'lc', 
              times = c('pct_dev','pct_ag','pct_for','pct_wet','pct_bar'), 
              direction =  'long')

lb[lb$lc == 'pct_dev', c("lc")] <- "Developed Land"
lb[lb$lc == 'pct_ag', c("lc")] <- "Agricultural and Grassland"
lb[lb$lc == 'pct_for', c("lc")] <- "Forest and Shrub Land"
lb[lb$lc == 'pct_wet', c("lc")] <- "Wetland"
lb[lb$lc == 'pct_bar', c("lc")] <- "Barren Land"
# lb[lb$lc == 'pct_ots', c("lc")] <- "Out of State"


write.csv(lb, 'lake_shoreline/data/lake_shoreline_lc.csv', 
          row.names = FALSE)

#### Statewide Summaries #####

lb16$cnt_dev  <- (lb16$HISTO_2 + lb16$HISTO_5)
lb16$cnt_ag   <- (lb16$HISTO_6 + lb16$HISTO_7 + lb16$HISTO_8) 
lb16$cnt_for  <- (lb16$HISTO_11 + lb16$HISTO_12) 
lb16$cnt_wet  <- (lb16$HISTO_13 + lb16$HISTO_14 + lb16$HISTO_15)
lb16$cnt_bar  <- (lb16$HISTO_19 + lb16$HISTO_20) 

sum_lb<- as.data.frame(lapply(lb16[,c(25,32:36)],sum))

sum_lb$pct_dev <- (sum_lb$cnt_dev / sum_lb$cnt) * 100
sum_lb$pct_ag  <- (sum_lb$cnt_ag / sum_lb$cnt) * 100
sum_lb$pct_for <- (sum_lb$cnt_for / sum_lb$cnt) * 100
sum_lb$pct_wet <- (sum_lb$cnt_wet / sum_lb$cnt) * 100
sum_lb$pct_bar <- (sum_lb$cnt_bar / sum_lb$cnt) * 100

lb_sum <- reshape(sum_lb[,c(1,7:11)], 
              varying = c('pct_dev','pct_ag','pct_for','pct_wet','pct_bar'),
              idvar = 'cnt',
              v.names = 'pct', 
              timevar = 'lc', 
              times = c('pct_dev','pct_ag','pct_for','pct_wet','pct_bar'), 
              direction =  'long')

lb_sum[lb_sum$lc == 'pct_dev', c("lc")] <- "Developed Land"
lb_sum[lb_sum$lc == 'pct_ag', c("lc")] <- "Agricultural and Grassland"
lb_sum[lb_sum$lc == 'pct_for', c("lc")] <- "Forest and Shrub Land"
lb_sum[lb_sum$lc == 'pct_wet', c("lc")] <- "Wetland"
lb_sum[lb_sum$lc == 'pct_bar', c("lc")] <- "Barren Land"

write.csv(lb_sum[,c(2:3)], 'lake_shoreline/data/lake_shoreline_lc_statewide.csv', 
          row.names = FALSE)