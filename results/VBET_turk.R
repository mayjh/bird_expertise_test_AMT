### VBET data processing
library(rPython)
trim.mean = function(x) { mean(x[x>(mean(x)-sd(x)*3) & x<(mean(x)+sd(x)*3)]) }

test_data = read.csv("/Users/jianhongshen/Documents/Turk/VBET/results/test_data.csv",stringsAsFactors=F)
survey_data = read.csv("/Users/jianhongshen/Documents/Turk/VBET/results/survey_data.csv",stringsAsFactors=F)

n_item = length(unique(test_data$trial_index))
n_subj = length(unique(test_data$uniqueid))
test_data$acc = as.numeric(test_data$answer == (test_data$key_press-48))
rt = matrix(test_data$rt, nrow=n_subj, ncol=n_item, byrow=T)
acc = matrix(test_data$acc, nrow=n_subj, ncol=n_item, byrow=T)

print(cbind(unique(test_data$uniqueid),rowMeans(acc))); print(colMeans(acc))
print(sort(apply(rt,1,trim.mean)))
